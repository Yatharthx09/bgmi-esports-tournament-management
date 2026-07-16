from flask import Blueprint, request
from app import db
from app.models.result import MatchResult
from app.models.match import Match
from app.middleware.auth_required import roles_required
from app.utils.validators import require_fields
from app.utils.responses import success, error
from app.services.leaderboard_service import recalculate_leaderboard

results_bp = Blueprint("results", __name__)


@results_bp.route("/match/<int:match_id>", methods=["GET"])
def list_results(match_id):
    results = MatchResult.query.filter_by(match_id=match_id).order_by(MatchResult.placement.asc()).all()
    return success({"results": [r.to_dict() for r in results]})


@results_bp.route("", methods=["POST"])
@roles_required("admin")
def add_result():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["match_id", "team_id", "placement"])
    if missing:
        return error(f"Missing required fields: {', '.join(missing)}", 422)

    match = Match.query.get(data["match_id"])
    if not match:
        return error("Match not found", 404)

    if MatchResult.query.filter_by(match_id=data["match_id"], team_id=data["team_id"]).first():
        return error("A result for this team in this match already exists. Edit it instead.", 409)

    placement = int(data["placement"])
    if placement < 1 or placement > 32:
        return error("Placement must be between 1 and 32", 422)

    result = MatchResult(
        match_id=data["match_id"],
        team_id=data["team_id"],
        placement=placement,
        finishes=int(data.get("finishes", 0)),
    )
    result.calculate_points()
    db.session.add(result)
    match.status = "completed" if data.get("finalize") else match.status
    db.session.commit()

    recalculate_leaderboard(match.tournament_id)
    return success({"result": result.to_dict()}, "Result recorded successfully", 201)


@results_bp.route("/bulk", methods=["POST"])
@roles_required("admin")
def add_results_bulk():
    """Enter results for all teams in a match at once.
    Body: { match_id, results: [{team_id, placement, finishes}], finalize: bool }"""
    data = request.get_json(silent=True) or {}
    match_id = data.get("match_id")
    entries = data.get("results", [])
    if not match_id or not entries:
        return error("match_id and results[] are required", 422)

    match = Match.query.get(match_id)
    if not match:
        return error("Match not found", 404)

    MatchResult.query.filter_by(match_id=match_id).delete()

    for e in entries:
        pmissing = require_fields(e, ["team_id", "placement"])
        if pmissing:
            db.session.rollback()
            return error("Each result needs team_id and placement", 422)
        result = MatchResult(
            match_id=match_id,
            team_id=e["team_id"],
            placement=int(e["placement"]),
            finishes=int(e.get("finishes", 0)),
        )
        result.calculate_points()
        db.session.add(result)

    if data.get("finalize"):
        match.status = "completed"

    db.session.commit()
    recalculate_leaderboard(match.tournament_id)

    results = MatchResult.query.filter_by(match_id=match_id).order_by(MatchResult.placement.asc()).all()
    return success({"results": [r.to_dict() for r in results]}, "Match results saved successfully", 201)


@results_bp.route("/<int:result_id>", methods=["PUT"])
@roles_required("admin")
def update_result(result_id):
    result = MatchResult.query.get(result_id)
    if not result:
        return error("Result not found", 404)

    data = request.get_json(silent=True) or {}
    if "placement" in data:
        result.placement = int(data["placement"])
    if "finishes" in data:
        result.finishes = int(data["finishes"])
    result.calculate_points()
    db.session.commit()

    recalculate_leaderboard(result.match.tournament_id)
    return success({"result": result.to_dict()}, "Result updated successfully")


@results_bp.route("/<int:result_id>", methods=["DELETE"])
@roles_required("admin")
def delete_result(result_id):
    result = MatchResult.query.get(result_id)
    if not result:
        return error("Result not found", 404)
    tournament_id = result.match.tournament_id
    db.session.delete(result)
    db.session.commit()
    recalculate_leaderboard(tournament_id)
    return success(None, "Result deleted successfully")
