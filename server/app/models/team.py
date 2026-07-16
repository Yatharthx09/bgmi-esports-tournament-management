from datetime import datetime, timezone
from app import db


class Team(db.Model):
    __tablename__ = "teams"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    tag = db.Column(db.String(10), nullable=True)
    logo_url = db.Column(db.String(255), nullable=True)
    logo_gradient = db.Column(db.String(60), default="from-emerald-400 to-cyan-500")
    captain_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    captain = db.relationship("User", back_populates="team", foreign_keys=[captain_id])
    players = db.relationship("Player", back_populates="team", cascade="all, delete-orphan")
    registrations = db.relationship("TournamentRegistration", back_populates="team", cascade="all, delete-orphan")
    match_results = db.relationship("MatchResult", back_populates="team", cascade="all, delete-orphan")
    leaderboard_entries = db.relationship("LeaderboardEntry", back_populates="team", cascade="all, delete-orphan")

    def to_dict(self, include_players=True):
        data = {
            "id": self.id,
            "name": self.name,
            "tag": self.tag,
            "logo_url": self.logo_url,
            "logo_gradient": self.logo_gradient,
            "captain_id": self.captain_id,
            "captain_name": self.captain.name if self.captain else None,
            "bio": self.bio,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "player_count": len(self.players) if self.players else 0,
        }
        if include_players:
            data["players"] = [p.to_dict() for p in self.players]
        return data

    def __repr__(self):
        return f"<Team {self.name}>"
