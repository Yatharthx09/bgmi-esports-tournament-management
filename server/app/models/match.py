from datetime import datetime, timezone, timedelta
from app import db


class Match(db.Model):
    __tablename__ = "matches"

    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey("tournaments.id"), nullable=False)
    match_number = db.Column(db.Integer, nullable=False)
    map = db.Column(db.String(40), nullable=False, default="Erangel")
    mode = db.Column(db.String(20), nullable=False, default="squad")
    scheduled_time = db.Column(db.DateTime, nullable=False)
    room_id = db.Column(db.String(60), nullable=True)
    room_password = db.Column(db.String(60), nullable=True)
    reveal_minutes_before = db.Column(db.Integer, default=30)
    status = db.Column(db.String(20), default="scheduled")  # scheduled, live, completed
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    tournament = db.relationship("Tournament", back_populates="matches")
    results = db.relationship("MatchResult", back_populates="match", cascade="all, delete-orphan")

    def room_visible_now(self):
        if not self.room_id:
            return False
        reveal_at = self.scheduled_time - timedelta(minutes=self.reveal_minutes_before or 0)
        return datetime.now(timezone.utc).replace(tzinfo=None) >= reveal_at

    def to_dict(self, reveal_room=False):
        data = {
            "id": self.id,
            "tournament_id": self.tournament_id,
            "match_number": self.match_number,
            "map": self.map,
            "mode": self.mode,
            "scheduled_time": self.scheduled_time.isoformat() if self.scheduled_time else None,
            "status": self.status,
            "reveal_minutes_before": self.reveal_minutes_before,
            "room_available": self.room_visible_now(),
            "result_count": len(self.results) if self.results else 0,
        }
        if reveal_room and self.room_visible_now():
            data["room_id"] = self.room_id
            data["room_password"] = self.room_password
        else:
            data["room_id"] = None
            data["room_password"] = None
        return data

    def to_dict_admin(self):
        """Full detail for admins, always includes room credentials."""
        data = self.to_dict(reveal_room=False)
        data["room_id"] = self.room_id
        data["room_password"] = self.room_password
        return data

    def __repr__(self):
        return f"<Match #{self.match_number} T{self.tournament_id}>"
