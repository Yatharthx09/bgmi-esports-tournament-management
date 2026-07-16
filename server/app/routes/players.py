from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app import db
from app.models.player import Player
from app.models.team import Team
from app.utils.validators import require_fields
from app.utils.responses import success, error

players_bp = Blueprint("players", __name__)


def _can_edit_team(team, claims, user_id):
    return claims.get("role") == "admin" or team.captain_id == user_id


@players_bp.route("/team/<int:team_id>", methods=["GET"])
def list_players(team_id):
    players = Player.query.filter_by(team_id=team_id).all()
    return success({"players": [p.to_dict() for p in players]})


@players_bp.route("", methods=["POST"])
@jwt_required()
def add_player():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["team_id", "name", "bgmi_id", "ign"])
    if missing:
        return error(f"Missing required fields: {', '.join(missing)}", 422)

    team = Team.query.get(data["team_id"])
    if not team:
        return error("Team not found", 404)

    claims = get_jwt()
    user_id = int(get_jwt_identity())
    if not _can_edit_team(team, claims, user_id):
        return error("You do not have permission to modify this team's roster", 403)

    if len(team.players) >= 5:
        return error("A team can have at most 4 players and 1 substitute", 422)

    player = Player(
        team_id=team.id,
        name=data["name"],
        bgmi_id=data["bgmi_id"],
        ign=data["ign"],
        is_substitute=bool(data.get("is_substitute")),
        role="substitute" if data.get("is_substitute") else "player",
    )
    db.session.add(player)
    db.session.commit()
    return success({"player": player.to_dict()}, "Player added successfully", 201)


@players_bp.route("/<int:player_id>", methods=["PUT"])
@jwt_required()
def update_player(player_id):
    player = Player.query.get(player_id)
    if not player:
        return error("Player not found", 404)

    claims = get_jwt()
    user_id = int(get_jwt_identity())
    if not _can_edit_team(player.team, claims, user_id):
        return error("You do not have permission to modify this player", 403)

    data = request.get_json(silent=True) or {}
    for field in ("name", "bgmi_id", "ign"):
        if data.get(field):
            setattr(player, field, data[field])
    if "is_substitute" in data:
        player.is_substitute = bool(data["is_substitute"])
        player.role = "substitute" if player.is_substitute else "player"

    db.session.commit()
    return success({"player": player.to_dict()}, "Player updated successfully")


@players_bp.route("/<int:player_id>", methods=["DELETE"])
@jwt_required()
def delete_player(player_id):
    player = Player.query.get(player_id)
    if not player:
        return error("Player not found", 404)

    claims = get_jwt()
    user_id = int(get_jwt_identity())
    if not _can_edit_team(player.team, claims, user_id):
        return error("You do not have permission to modify this player", 403)

    db.session.delete(player)
    db.session.commit()
    return success(None, "Player removed successfully")
