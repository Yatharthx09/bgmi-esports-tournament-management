from datetime import datetime, timezone
from app import db

PLACEMENT_POINTS = {
    1: 15,
    2: 12,
    3: 10,
    4: 8,
    5: 6,
    6: 4,
    7: 2,
}
DEFAULT_LOW_PLACEMENT_POINTS = 1  # 8th - 16th place


def placement_points_for(rank):
    if rank in PLACEMENT_POINTS:
        return PLACEMENT_POINTS[rank]
    if 8 <= rank <= 16:
        return DEFAULT_LOW_PLACEMENT_POINTS
    return 0


class MatchResult(db.Model):
    __tablename__ = "match_results"

    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey("matches.id"), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    placement = db.Column(db.Integer, nullable=False)  # 1 = chicken dinner
    finishes = db.Column(db.Integer, default=0)  # total kills by team in that match
    placement_points = db.Column(db.Integer, default=0)
    finish_points = db.Column(db.Integer, default=0)
    total_points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint("match_id", "team_id", name="uq_match_team_result"),)

    match = db.relationship("Match", back_populates="results")
    team = db.relationship("Team", back_populates="match_results")

    def calculate_points(self):
        self.placement_points = placement_points_for(self.placement)
        self.finish_points = self.finishes or 0
        self.total_points = self.placement_points + self.finish_points

    def to_dict(self):
        return {
            "id": self.id,
            "match_id": self.match_id,
            "team_id": self.team_id,
            "team_name": self.team.name if self.team else None,
            "placement": self.placement,
            "finishes": self.finishes,
            "placement_points": self.placement_points,
            "finish_points": self.finish_points,
            "total_points": self.total_points,
            "is_chicken_dinner": self.placement == 1,
        }

    def __repr__(self):
        return f"<Result M{self.match_id}-Tm{self.team_id} #{self.placement}>"
