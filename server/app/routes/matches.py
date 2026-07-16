from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request

from app import db
from app.models.match import Match
from app.models.team import Team
from app.models.registration import TournamentRegistration
from app.middleware.auth_required import roles_required
from app.utils.validators import require_fields, parse_datetime
from app.utils.responses import success, error

matches_bp = Blueprint("matches", __name__)


def _team_is_approved_for(user_id, tournament_id):
    team = Team.query.filter_by(captain_id=user_id).first()
    if not team:
        return False
    reg = TournamentRegistration.query.filter_by(
        tournament_id=tournament_id, team_id=team.id, status="approved"
    ).first()
    return bool(reg)


@matches_bp.route("/tournament/<int:tournament_id>", methods=["GET"])
def list_matches(tournament_id):
    reveal = False
    try:
        verify_jwt_in_request(optional=True)
        claims = get_jwt()
        if claims:
            if claims.get("role") == "admin":
                reveal = True
            elif claims.get("role") == "captain":
                from flask_jwt_extended import get_jwt_identity as gji
                reveal = _team_is_approved_for(int(gji()), tournament_id)
    except Exception:
        pass

    matches = Match.query.filter_by(tournament_id=tournament_id).order_by(Match.match_number.asc()).all()
    if reveal:
        return success({"matches": [m.to_dict(reveal_room=True) for m in matches]})
    return success({"matches": [m.to_dict(reveal_room=False) for m in matches]})


@matches_bp.route("/<int:match_id>", methods=["GET"])
@jwt_required()
def get_match(match_id):
    match = Match.query.get(match_id)
    if not match:
        return error("Match not found", 404)

    claims = get_jwt()
    reveal = claims.get("role") == "admin"
    if claims.get("role") == "captain":
        reveal = _team_is_approved_for(int(get_jwt_identity()), match.tournament_id)

    return success({"match": match.to_dict(reveal_room=reveal)})


@matches_bp.route("", methods=["POST"])
@roles_required("admin")
def create_match():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["tournament_id", "match_number", "map", "mode", "scheduled_time"])
    if missing:
        return error(f"Missing required fields: {', '.join(missing)}", 422)

    scheduled_time = parse_datetime(data["scheduled_time"])
    if not scheduled_time:
        return error("Invalid scheduled_time format", 422)

    match = Match(
        tournament_id=data["tournament_id"],
        match_number=int(data["match_number"]),
        map=data["map"],
        mode=data["mode"],
        scheduled_time=scheduled_time,
        room_id=data.get("room_id"),
        room_password=data.get("room_password"),
        reveal_minutes_before=int(data.get("reveal_minutes_before", 30)),
        status=data.get("status", "scheduled"),
    )
    db.session.add(match)
    db.session.commit()
    return success({"match": match.to_dict_admin()}, "Match created successfully", 201)


@matches_bp.route("/<int:match_id>", methods=["PUT"])
@roles_required("admin")
def update_match(match_id):
    match = Match.query.get(match_id)
    if not match:
        return error("Match not found", 404)

    data = request.get_json(silent=True) or {}
    for field in ("map", "mode", "room_id", "room_password", "status"):
        if field in data:
            setattr(match, field, data[field])
    if "match_number" in data:
        match.match_number = int(data["match_number"])
    if "reveal_minutes_before" in data:
        match.reveal_minutes_before = int(data["reveal_minutes_before"])
    if "scheduled_time" in data:
        dt = parse_datetime(data["scheduled_time"])
        if dt:
            match.scheduled_time = dt

    db.session.commit()
    return success({"match": match.to_dict_admin()}, "Match updated successfully")


@matches_bp.route("/<int:match_id>", methods=["DELETE"])
@roles_required("admin")
def delete_match(match_id):
    match = Match.query.get(match_id)
    if not match:
        return error("Match not found", 404)
    db.session.delete(match)
    db.session.commit()
    return success(None, "Match deleted successfully")
