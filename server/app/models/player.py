from datetime import datetime, timezone
from app import db


class Player(db.Model):
    __tablename__ = "players"

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    bgmi_id = db.Column(db.String(60), nullable=False)
    ign = db.Column(db.String(60), nullable=False)  # in-game name
    role = db.Column(db.String(30), default="player")  # player, substitute
    is_substitute = db.Column(db.Boolean, default=False)
    kills = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    team = db.relationship("Team", back_populates="players")

    def to_dict(self):
        return {
            "id": self.id,
            "team_id": self.team_id,
            "name": self.name,
            "bgmi_id": self.bgmi_id,
            "ign": self.ign,
            "role": self.role,
            "is_substitute": self.is_substitute,
            "kills": self.kills,
        }

    def __repr__(self):
        return f"<Player {self.ign}>"
