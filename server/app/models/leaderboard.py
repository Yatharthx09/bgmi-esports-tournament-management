from datetime import datetime, timezone
from app import db


class LeaderboardEntry(db.Model):
    """Aggregated, cached leaderboard row for a team within a tournament.
    Recalculated whenever a match result is entered/edited."""

    __tablename__ = "leaderboard_entries"

    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey("tournaments.id"), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    matches_played = db.Column(db.Integer, default=0)
    placement_points = db.Column(db.Integer, default=0)
    finish_points = db.Column(db.Integer, default=0)
    total_points = db.Column(db.Integer, default=0)
    chicken_dinners = db.Column(db.Integer, default=0)
    total_finishes = db.Column(db.Integer, default=0)
    average_placement = db.Column(db.Float, default=0)
    rank = db.Column(db.Integer, nullable=True)
    updated_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (db.UniqueConstraint("tournament_id", "team_id", name="uq_leaderboard_tournament_team"),)

    tournament = db.relationship("Tournament", back_populates="leaderboard_entries")
    team = db.relationship("Team", back_populates="leaderboard_entries")

    def to_dict(self):
        return {
            "id": self.id,
            "tournament_id": self.tournament_id,
            "team_id": self.team_id,
            "team_name": self.team.name if self.team else None,
            "team_logo_gradient": self.team.logo_gradient if self.team else None,
            "rank": self.rank,
            "matches_played": self.matches_played,
            "placement_points": self.placement_points,
            "finish_points": self.finish_points,
            "total_points": self.total_points,
            "chicken_dinners": self.chicken_dinners,
            "total_finishes": self.total_finishes,
            "average_placement": round(self.average_placement, 2) if self.average_placement else 0,
        }

    def __repr__(self):
        return f"<Leaderboard T{self.tournament_id}-Tm{self.team_id} rank {self.rank}>"
