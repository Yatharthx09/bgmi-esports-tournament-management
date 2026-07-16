from app import db
from app.models.result import MatchResult
from app.models.leaderboard import LeaderboardEntry
from app.models.match import Match
from app.models.registration import TournamentRegistration


def recalculate_leaderboard(tournament_id):
    """Recompute the leaderboard for a tournament from scratch based on all match results."""
    team_ids = [
        r.team_id
        for r in TournamentRegistration.query.filter_by(tournament_id=tournament_id, status="approved").all()
    ]

    match_ids = [m.id for m in Match.query.filter_by(tournament_id=tournament_id).all()]

    stats = {tid: {
        "matches_played": 0,
        "placement_points": 0,
        "finish_points": 0,
        "total_points": 0,
        "chicken_dinners": 0,
        "total_finishes": 0,
        "placements": [],
    } for tid in team_ids}

    if match_ids:
        results = MatchResult.query.filter(MatchResult.match_id.in_(match_ids)).all()
        for r in results:
            if r.team_id not in stats:
                stats[r.team_id] = {
                    "matches_played": 0,
                    "placement_points": 0,
                    "finish_points": 0,
                    "total_points": 0,
                    "chicken_dinners": 0,
                    "total_finishes": 0,
                    "placements": [],
                }
            s = stats[r.team_id]
            s["matches_played"] += 1
            s["placement_points"] += r.placement_points
            s["finish_points"] += r.finish_points
            s["total_points"] += r.total_points
            s["total_finishes"] += r.finishes or 0
            s["placements"].append(r.placement)
            if r.placement == 1:
                s["chicken_dinners"] += 1

    # Wipe and rebuild leaderboard entries for this tournament
    LeaderboardEntry.query.filter_by(tournament_id=tournament_id).delete()

    entries = []
    for team_id, s in stats.items():
        avg_placement = (sum(s["placements"]) / len(s["placements"])) if s["placements"] else 0
        entry = LeaderboardEntry(
            tournament_id=tournament_id,
            team_id=team_id,
            matches_played=s["matches_played"],
            placement_points=s["placement_points"],
            finish_points=s["finish_points"],
            total_points=s["total_points"],
            chicken_dinners=s["chicken_dinners"],
            total_finishes=s["total_finishes"],
            average_placement=avg_placement,
        )
        entries.append(entry)

    # Sort by total_points desc, then chicken dinners desc, then avg placement asc
    entries.sort(key=lambda e: (-e.total_points, -e.chicken_dinners, e.average_placement))
    for idx, entry in enumerate(entries, start=1):
        entry.rank = idx
        db.session.add(entry)

    db.session.commit()
    return entries
