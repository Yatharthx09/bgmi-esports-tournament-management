from datetime import datetime, timezone
from app import db


class TournamentRegistration(db.Model):
    __tablename__ = "tournament_registrations"

    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey("tournaments.id"), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending, approved, rejected
    requested_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    decided_at = db.Column(db.DateTime, nullable=True)
    decided_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    __table_args__ = (db.UniqueConstraint("tournament_id", "team_id", name="uq_tournament_team"),)

    tournament = db.relationship("Tournament", back_populates="registrations")
    team = db.relationship("Team", back_populates="registrations")

    def to_dict(self):
        return {
            "id": self.id,
            "tournament_id": self.tournament_id,
            "tournament_title": self.tournament.title if self.tournament else None,
            "team_id": self.team_id,
            "team_name": self.team.name if self.team else None,
            "team_logo_gradient": self.team.logo_gradient if self.team else None,
            "status": self.status,
            "requested_at": self.requested_at.isoformat() if self.requested_at else None,
            "decided_at": self.decided_at.isoformat() if self.decided_at else None,
        }

    def __repr__(self):
        return f"<Registration T{self.tournament_id}-Tm{self.team_id} {self.status}>"
