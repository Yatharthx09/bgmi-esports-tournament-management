from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app import db
from app.models.team import Team
from app.models.player import Player
from app.models.user import User
from app.middleware.auth_required import roles_required
from app.utils.validators import require_fields
from app.utils.responses import success, error

teams_bp = Blueprint("teams", __name__)

GRADIENTS = [
    "from-emerald-400 to-cyan-500",
    "from-purple-500 to-indigo-500",
    "from-fuchsia-500 to-purple-600",
    "from-blue-500 to-cyan-400",
    "from-lime-400 to-emerald-500",
    "from-orange-500 to-rose-500",
]


@teams_bp.route("", methods=["GET"])
def list_teams():
    search = request.args.get("search", "").strip()
    query = Team.query
    if search:
        query = query.filter(Team.name.ilike(f"%{search}%"))
    teams = query.order_by(Team.created_at.desc()).all()
    return success({"teams": [t.to_dict() for t in teams], "total": len(teams)})


@teams_bp.route("/<int:team_id>", methods=["GET"])
def get_team(team_id):
    team = Team.query.get(team_id)
    if not team:
        return error("Team not found", 404)
    return success({"team": team.to_dict()})


@teams_bp.route("/my-team", methods=["GET"])
@jwt_required()
def my_team():
    user_id = int(get_jwt_identity())
    team = Team.query.filter_by(captain_id=user_id).first()
    if not team:
        return success({"team": None}, "No team registered yet")
    return success({"team": team.to_dict()})


@teams_bp.route("", methods=["POST"])
@roles_required("captain", "admin")
def create_team():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    missing = require_fields(data, ["name", "players"])
    if missing:
        return error(f"Missing required fields: {', '.join(missing)}", 422)

    if Team.query.filter_by(captain_id=user_id).first():
        return error("You have already registered a team", 409)

    if Team.query.filter_by(name=data["name"]).first():
        return error("A team with this name already exists", 409)

    players = data.get("players", [])
    non_subs = [p for p in players if not p.get("is_substitute")]
    if len(non_subs) < 1 or len(players) > 5:
        return error("A team needs 1-4 main players plus up to 1 substitute", 422)

    import random
    team = Team(
        name=data["name"],
        tag=data.get("tag"),
        captain_id=user_id,
        bio=data.get("bio"),
        logo_gradient=random.choice(GRADIENTS),
    )
    db.session.add(team)
    db.session.flush()

    for p in players:
        pmissing = require_fields(p, ["name", "bgmi_id", "ign"])
        if pmissing:
            db.session.rollback()
            return error(f"Each player needs: name, bgmi_id, ign", 422)
        player = Player(
            team_id=team.id,
            name=p["name"],
            bgmi_id=p["bgmi_id"],
            ign=p["ign"],
            is_substitute=bool(p.get("is_substitute")),
            role="substitute" if p.get("is_substitute") else "player",
        )
        db.session.add(player)

    db.session.commit()
    return success({"team": team.to_dict()}, "Team registered successfully", 201)


@teams_bp.route("/<int:team_id>", methods=["PUT"])
@jwt_required()
def update_team(team_id):
    team = Team.query.get(team_id)
    if not team:
        return error("Team not found", 404)

    claims = get_jwt()
    user_id = int(get_jwt_identity())
    if claims.get("role") != "admin" and team.captain_id != user_id:
        return error("You do not have permission to edit this team", 403)

    data = request.get_json(silent=True) or {}
    if "name" in data and data["name"].strip():
        team.name = data["name"].strip()
    if "tag" in data:
        team.tag = data["tag"]
    if "bio" in data:
        team.bio = data["bio"]
    if "logo_url" in data:
        team.logo_url = data["logo_url"]

    db.session.commit()
    return success({"team": team.to_dict()}, "Team updated successfully")


@teams_bp.route("/<int:team_id>", methods=["DELETE"])
@roles_required("admin")
def delete_team(team_id):
    team = Team.query.get(team_id)
    if not team:
        return error("Team not found", 404)
    db.session.delete(team)
    db.session.commit()
    return success(None, "Team deleted successfully")
