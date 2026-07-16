from collections import defaultdict
from flask import Blueprint, request
from sqlalchemy import func

from app import db
from app.models.tournament import Tournament
from app.models.team import Team
from app.models.player import Player
from app.models.match import Match
from app.models.result import MatchResult
from app.models.registration import TournamentRegistration
from app.models.leaderboard import LeaderboardEntry
from app.utils.responses import success

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/summary", methods=["GET"])
def summary():
    tournament_id = request.args.get("tournament_id")

    teams_q = Team.query
    matches_q = Match.query
    results_q = MatchResult.query

    if tournament_id:
        team_ids = [
            r.team_id for r in TournamentRegistration.query.filter_by(
                tournament_id=tournament_id, status="approved"
            ).all()
        ]
        match_ids = [m.id for m in Match.query.filter_by(tournament_id=tournament_id).all()]
        total_teams = len(team_ids)
        total_matches = len(match_ids)
        results = MatchResult.query.filter(MatchResult.match_id.in_(match_ids)).all() if match_ids else []
        tournament = Tournament.query.get(tournament_id)
        prize_pool = tournament.prize_pool if tournament else 0
    else:
        total_teams = Team.query.count()
        total_matches = Match.query.count()
        results = MatchResult.query.all()
        prize_pool = db.session.query(func.sum(Tournament.prize_pool)).scalar() or 0

    total_finishes = sum(r.finishes or 0 for r in results)
    total_points = sum(r.total_points or 0 for r in results)
    avg_points = round(total_points / len(results), 2) if results else 0

    return success({
        "total_tournaments": Tournament.query.count() if not tournament_id else 1,
        "total_teams": total_teams,
        "total_matches": total_matches,
        "total_players": Player.query.count(),
        "prize_pool": prize_pool,
        "total_finishes": total_finishes,
        "average_points": avg_points,
    })


@analytics_bp.route("/registrations-over-time", methods=["GET"])
def registrations_over_time():
    tournament_id = request.args.get("tournament_id")
    query = TournamentRegistration.query
    if tournament_id:
        query = query.filter_by(tournament_id=tournament_id)
    regs = query.order_by(TournamentRegistration.requested_at.asc()).all()

    buckets = defaultdict(int)
    for r in regs:
        key = r.requested_at.strftime("%Y-%m-%d") if r.requested_at else "unknown"
        buckets[key] += 1

    cumulative = []
    running = 0
    for date in sorted(buckets.keys()):
        running += buckets[date]
        cumulative.append({"date": date, "registrations": buckets[date], "cumulative": running})

    return success({"series": cumulative})


@analytics_bp.route("/top-teams", methods=["GET"])
def top_teams():
    tournament_id = request.args.get("tournament_id")
    limit = int(request.args.get("limit", 10))

    query = LeaderboardEntry.query
    if tournament_id:
        query = query.filter_by(tournament_id=tournament_id)

    entries = query.all()
    agg = defaultdict(lambda: {"team_name": "", "total_points": 0, "chicken_dinners": 0})
    for e in entries:
        agg[e.team_id]["team_name"] = e.team.name if e.team else ""
        agg[e.team_id]["total_points"] += e.total_points
        agg[e.team_id]["chicken_dinners"] += e.chicken_dinners

    rows = sorted(agg.values(), key=lambda x: -x["total_points"])[:limit]
    return success({"teams": rows})


@analytics_bp.route("/points-breakdown", methods=["GET"])
def points_breakdown():
    tournament_id = request.args.get("tournament_id")
    query = LeaderboardEntry.query
    if tournament_id:
        query = query.filter_by(tournament_id=tournament_id)
    entries = query.order_by(LeaderboardEntry.rank.asc()).limit(10).all()

    return success({
        "teams": [
            {
                "team_name": e.team.name if e.team else "",
                "placement_points": e.placement_points,
                "finish_points": e.finish_points,
            }
            for e in entries
        ]
    })


@analytics_bp.route("/match-trend", methods=["GET"])
def match_trend():
    tournament_id = request.args.get("tournament_id")
    if not tournament_id:
        return success({"series": []})

    matches = Match.query.filter_by(tournament_id=tournament_id).order_by(Match.match_number.asc()).all()
    series = []
    for m in matches:
        total = sum(r.total_points for r in m.results)
        series.append({"match": f"Match {m.match_number}", "total_points": total, "teams": len(m.results)})

    return success({"series": series})


@analytics_bp.route("/top-players", methods=["GET"])
def top_players():
    limit = int(request.args.get("limit", 10))
    players = Player.query.order_by(Player.kills.desc()).limit(limit).all()
    return success({
        "players": [
            {"name": p.ign, "team": p.team.name if p.team else "", "kills": p.kills} for p in players
        ]
    })


@analytics_bp.route("/map-performance", methods=["GET"])
def map_performance():
    tournament_id = request.args.get("tournament_id")
    query = Match.query
    if tournament_id:
        query = query.filter_by(tournament_id=tournament_id)
    matches = query.all()

    map_stats = defaultdict(lambda: {"matches": 0, "avg_points": 0, "_total": 0})
    for m in matches:
        map_stats[m.map]["matches"] += 1
        map_stats[m.map]["_total"] += sum(r.total_points for r in m.results)

    rows = []
    for map_name, s in map_stats.items():
        avg = round(s["_total"] / s["matches"], 2) if s["matches"] else 0
        rows.append({"map": map_name, "matches": s["matches"], "avg_points": avg})

    return success({"maps": rows})
