from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.registration import TournamentRegistration
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.notification import Notification
from app.middleware.auth_required import roles_required
from app.utils.responses import success, error

registrations_bp = Blueprint("registrations", __name__)


@registrations_bp.route("", methods=["GET"])
def list_registrations():
    tournament_id = request.args.get("tournament_id")
    team_id = request.args.get("team_id")
    status = request.args.get("status")

    query = TournamentRegistration.query
    if tournament_id:
        query = query.filter_by(tournament_id=tournament_id)
    if team_id:
        query = query.filter_by(team_id=team_id)
    if status:
        query = query.filter_by(status=status)

    regs = query.order_by(TournamentRegistration.requested_at.desc()).all()
    return success({"registrations": [r.to_dict() for r in regs], "total": len(regs)})


@registrations_bp.route("", methods=["POST"])
@roles_required("captain")
def register_for_tournament():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    tournament_id = data.get("tournament_id")
    if not tournament_id:
        return error("tournament_id is required", 422)

    team = Team.query.filter_by(captain_id=user_id).first()
    if not team:
        return error("You must register a team before joining tournaments", 422)

    tournament = Tournament.query.get(tournament_id)
    if not tournament:
        return error("Tournament not found", 404)

    if tournament.status not in ("upcoming", "registration_open"):
        return error("Registration is closed for this tournament", 422)

    if tournament.slots_filled() >= tournament.total_slots:
        return error("This tournament is full", 422)

    if TournamentRegistration.query.filter_by(tournament_id=tournament_id, team_id=team.id).first():
        return error("Your team has already applied to this tournament", 409)

    reg = TournamentRegistration(tournament_id=tournament_id, team_id=team.id, status="pending")
    db.session.add(reg)
    db.session.commit()
    return success({"registration": reg.to_dict()}, "Registration request submitted", 201)


@registrations_bp.route("/<int:registration_id>/decision", methods=["PATCH"])
@roles_required("admin")
def decide_registration(registration_id):
    reg = TournamentRegistration.query.get(registration_id)
    if not reg:
        return error("Registration not found", 404)

    data = request.get_json(silent=True) or {}
    decision = data.get("status")
    if decision not in ("approved", "rejected"):
        return error("status must be 'approved' or 'rejected'", 422)

    admin_id = int(get_jwt_identity())
    reg.status = decision
    reg.decided_at = datetime.now(timezone.utc)
    reg.decided_by = admin_id

    if decision == "approved":
        reg.tournament.status = "registration_open" if reg.tournament.status == "upcoming" else reg.tournament.status

    notif = Notification(
        user_id=reg.team.captain_id,
        title=f"Registration {decision.title()}",
        message=f"Your team '{reg.team.name}' registration for '{reg.tournament.title}' was {decision}.",
        type="success" if decision == "approved" else "warning",
    )
    db.session.add(notif)
    db.session.commit()
    return success({"registration": reg.to_dict()}, f"Registration {decision}")


@registrations_bp.route("/<int:registration_id>", methods=["DELETE"])
@jwt_required()
def cancel_registration(registration_id):
    reg = TournamentRegistration.query.get(registration_id)
    if not reg:
        return error("Registration not found", 404)
    db.session.delete(reg)
    db.session.commit()
    return success(None, "Registration cancelled")
