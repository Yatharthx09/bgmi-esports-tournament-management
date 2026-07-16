from flask import Blueprint, request
from app import db
from app.models.user import User
from app.middleware.auth_required import roles_required
from app.utils.responses import success, error

users_bp = Blueprint("users", __name__)


@users_bp.route("", methods=["GET"])
@roles_required("admin")
def list_users():
    role = request.args.get("role")
    search = request.args.get("search", "").strip()
    query = User.query
    if role:
        query = query.filter_by(role=role)
    if search:
        like = f"%{search}%"
        query = query.filter(db.or_(User.name.ilike(like), User.username.ilike(like), User.email.ilike(like)))
    users = query.order_by(User.created_at.desc()).all()
    return success({"users": [u.to_dict() for u in users], "total": len(users)})


@users_bp.route("/<int:user_id>", methods=["GET"])
@roles_required("admin")
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error("User not found", 404)
    return success({"user": user.to_dict()})


@users_bp.route("/<int:user_id>/status", methods=["PATCH"])
@roles_required("admin")
def toggle_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return error("User not found", 404)
    data = request.get_json(silent=True) or {}
    user.is_active = bool(data.get("is_active", not user.is_active))
    db.session.commit()
    return success({"user": user.to_dict()}, "User status updated")


@users_bp.route("/<int:user_id>/role", methods=["PATCH"])
@roles_required("admin")
def update_role(user_id):
    user = User.query.get(user_id)
    if not user:
        return error("User not found", 404)
    data = request.get_json(silent=True) or {}
    role = data.get("role")
    if role not in ("admin", "captain", "viewer"):
        return error("Invalid role", 422)
    user.role = role
    db.session.commit()
    return success({"user": user.to_dict()}, "User role updated")
