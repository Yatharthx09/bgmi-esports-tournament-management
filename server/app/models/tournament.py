from datetime import datetime, timezone
from app import db


class Tournament(db.Model):
    __tablename__ = "tournaments"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    banner_url = db.Column(db.String(255), nullable=True)
    mode = db.Column(db.String(20), nullable=False, default="squad")  # solo, duo, squad
    map = db.Column(db.String(40), nullable=False, default="Erangel")
    entry_fee = db.Column(db.Float, default=0)
    prize_pool = db.Column(db.Float, default=0)
    total_slots = db.Column(db.Integer, default=16)
    start_date = db.Column(db.DateTime, nullable=False)
    registration_deadline = db.Column(db.DateTime, nullable=False)
    rules = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), default="upcoming")
    # upcoming, registration_open, ongoing, completed
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    registrations = db.relationship(
        "TournamentRegistration", back_populates="tournament", cascade="all, delete-orphan"
    )
    matches = db.relationship("Match", back_populates="tournament", cascade="all, delete-orphan")
    leaderboard_entries = db.relationship(
        "LeaderboardEntry", back_populates="tournament", cascade="all, delete-orphan"
    )

    def slots_filled(self):
        return len([r for r in self.registrations if r.status == "approved"])

    def to_dict(self, detailed=False):
        data = {
            "id": self.id,
            "title": self.title,
            "banner_url": self.banner_url,
            "mode": self.mode,
            "map": self.map,
            "entry_fee": self.entry_fee,
            "prize_pool": self.prize_pool,
            "total_slots": self.total_slots,
            "slots_filled": self.slots_filled(),
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "registration_deadline": self.registration_deadline.isoformat()
            if self.registration_deadline
            else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "match_count": len(self.matches) if self.matches else 0,
            "team_count": len(self.registrations) if self.registrations else 0,
        }
        if detailed:
            data["rules"] = self.rules
        return data

    def __repr__(self):
        return f"<Tournament {self.title}>"
