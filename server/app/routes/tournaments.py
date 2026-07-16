from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.tournament import Tournament
from app.middleware.auth_required import roles_required
from app.utils.validators import require_fields, parse_datetime
from app.utils.responses import success, error

tournaments_bp = Blueprint("tournaments", __name__)


@tournaments_bp.route("", methods=["GET"])
def list_tournaments():
    status = request.args.get("status")
    search = request.args.get("search", "").strip()
    mode = request.args.get("mode")

    query = Tournament.query
    if status:
        query = query.filter_by(status=status)
    if mode:
        query = query.filter_by(mode=mode)
    if search:
        query = query.filter(Tournament.title.ilike(f"%{search}%"))

    tournaments = query.order_by(Tournament.start_date.asc()).all()
    return success({"tournaments": [t.to_dict() for t in tournaments], "total": len(tournaments)})


@tournaments_bp.route("/<int:tournament_id>", methods=["GET"])
def get_tournament(tournament_id):
    tournament = Tournament.query.get(tournament_id)
    if not tournament:
        return error("Tournament not found", 404)
    return success({"tournament": tournament.to_dict(detailed=True)})


@tournaments_bp.route("", methods=["POST"])
@roles_required("admin")
def create_tournament():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["title", "mode", "map", "total_slots", "start_date", "registration_deadline"])
    if missing:
        return error(f"Missing required fields: {', '.join(missing)}", 422)

    start_date = parse_datetime(data["start_date"])
    reg_deadline = parse_datetime(data["registration_deadline"])
    if not start_date or not reg_deadline:
        return error("Invalid date format. Use ISO format e.g. 2026-08-01T18:00:00", 422)

    tournament = Tournament(
        title=data["title"],
        banner_url=data.get("banner_url"),
        mode=data["mode"],
        map=data["map"],
        entry_fee=float(data.get("entry_fee", 0)),
        prize_pool=float(data.get("prize_pool", 0)),
        total_slots=int(data["total_slots"]),
        start_date=start_date,
        registration_deadline=reg_deadline,
        rules=data.get("rules"),
        status=data.get("status", "upcoming"),
        created_by=user_id,
    )
    db.session.add(tournament)
    db.session.commit()
    return success({"tournament": tournament.to_dict(detailed=True)}, "Tournament created successfully", 201)


@tournaments_bp.route("/<int:tournament_id>", methods=["PUT"])
@roles_required("admin")
def update_tournament(tournament_id):
    tournament = Tournament.query.get(tournament_id)
    if not tournament:
        return error("Tournament not found", 404)

    data = request.get_json(silent=True) or {}
    for field in ("title", "banner_url", "mode", "map", "rules", "status"):
        if field in data and data[field] is not None:
            setattr(tournament, field, data[field])
    for field in ("entry_fee", "prize_pool"):
        if field in data:
            setattr(tournament, field, float(data[field]))
    if "total_slots" in data:
        tournament.total_slots = int(data["total_slots"])
    if "start_date" in data:
        dt = parse_datetime(data["start_date"])
        if dt:
            tournament.start_date = dt
    if "registration_deadline" in data:
        dt = parse_datetime(data["registration_deadline"])
        if dt:
            tournament.registration_deadline = dt

    db.session.commit()
    return success({"tournament": tournament.to_dict(detailed=True)}, "Tournament updated successfully")


@tournaments_bp.route("/<int:tournament_id>", methods=["DELETE"])
@roles_required("admin")
def delete_tournament(tournament_id):
    tournament = Tournament.query.get(tournament_id)
    if not tournament:
        return error("Tournament not found", 404)
    db.session.delete(tournament)
    db.session.commit()
    return success(None, "Tournament deleted successfully")
