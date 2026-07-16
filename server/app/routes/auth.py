from flask import Blueprint, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app import db
from app.models.user import User
from app.utils.validators import require_fields, is_valid_email
from app.utils.responses import success, error

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["name", "username", "email", "password"])
    if missing:
        return error(f"Missing required fields: {', '.join(missing)}", 422)

    if not is_valid_email(data["email"]):
        return error("Please enter a valid email address", 422)

    if len(data["password"]) < 6:
        return error("Password must be at least 6 characters long", 422)

    role = data.get("role", "viewer")
    if role not in ("captain", "viewer"):
        role = "viewer"  # admins cannot self-register

    if User.query.filter_by(username=data["username"]).first():
        return error("Username is already taken", 409)
    if User.query.filter_by(email=data["email"]).first():
        return error("Email is already registered", 409)

    user = User(name=data["name"], username=data["username"], email=data["email"], role=role, phone=data.get("phone"))
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role, "username": user.username})
    return success({"user": user.to_dict(), "token": token}, "Account created successfully", 201)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["identifier", "password"])
    if missing:
        return error("Username/email and password are required", 422)

    identifier = data["identifier"]
    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

    if not user or not user.check_password(data["password"]):
        return error("Invalid credentials", 401)

    if not user.is_active:
        return error("This account has been deactivated", 403)

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role, "username": user.username})
    return success({"user": user.to_dict(), "token": token}, "Login successful")


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return error("User not found", 404)
    return success({"user": user.to_dict()})


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return error("User not found", 404)
    data = request.get_json(silent=True) or {}

    if "name" in data and data["name"].strip():
        user.name = data["name"].strip()
    if "phone" in data:
        user.phone = data["phone"]
    if "avatar_url" in data:
        user.avatar_url = data["avatar_url"]
    if data.get("password"):
        if len(data["password"]) < 6:
            return error("Password must be at least 6 characters long", 422)
        user.set_password(data["password"])

    db.session.commit()
    return success({"user": user.to_dict()}, "Profile updated successfully")
