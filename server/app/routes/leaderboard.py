from flask import Blueprint, request, Response
from app.models.leaderboard import LeaderboardEntry
from app.middleware.auth_required import roles_required
from app.utils.responses import success, error
from app.services.leaderboard_service import recalculate_leaderboard
from app.services.csv_service import leaderboard_to_csv

leaderboard_bp = Blueprint("leaderboard", __name__)


@leaderboard_bp.route("/tournament/<int:tournament_id>", methods=["GET"])
def get_leaderboard(tournament_id):
    entries = (
        LeaderboardEntry.query.filter_by(tournament_id=tournament_id)
        .order_by(LeaderboardEntry.rank.asc())
        .all()
    )
    return success({"leaderboard": [e.to_dict() for e in entries]})


@leaderboard_bp.route("/tournament/<int:tournament_id>/recalculate", methods=["POST"])
@roles_required("admin")
def recalculate(tournament_id):
    entries = recalculate_leaderboard(tournament_id)
    return success({"leaderboard": [e.to_dict() for e in entries]}, "Leaderboard recalculated")


@leaderboard_bp.route("/tournament/<int:tournament_id>/export", methods=["GET"])
def export_csv(tournament_id):
    entries = (
        LeaderboardEntry.query.filter_by(tournament_id=tournament_id)
        .order_by(LeaderboardEntry.rank.asc())
        .all()
    )
    csv_data = leaderboard_to_csv(entries)
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename=leaderboard_tournament_{tournament_id}.csv"},
    )
