"""
Seed script for the BGMI Tournament Management System.
Run with: python seed.py
This wipes and recreates the database with realistic demo data.
"""
import random
from datetime import datetime, timedelta, timezone

from app import create_app, db
from app.models.user import User
from app.models.team import Team
from app.models.player import Player
from app.models.tournament import Tournament
from app.models.registration import TournamentRegistration
from app.models.match import Match
from app.models.result import MatchResult
from app.models.notification import Notification
from app.services.leaderboard_service import recalculate_leaderboard

app = create_app()

GRADIENTS = [
    "from-emerald-400 to-cyan-500",
    "from-purple-500 to-indigo-500",
    "from-fuchsia-500 to-purple-600",
    "from-blue-500 to-cyan-400",
    "from-lime-400 to-emerald-500",
    "from-orange-500 to-rose-500",
    "from-rose-500 to-pink-600",
    "from-cyan-400 to-blue-600",
]

TEAM_NAMES = [
    "Team Soul", "GodLike Esports", "OR Esports", "Team XSpark",
    "Revenant Esports", "Blind Esports", "Gladiators Esports", "Hydra Official",
]

MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi"]

FIRST_NAMES = [
    "Aarav", "Vihaan", "Vivaan", "Aditya", "Kabir", "Arjun", "Rohan", "Ishaan",
    "Sai", "Reyansh", "Dev", "Yash", "Karan", "Rudra", "Neel", "Om",
    "Aryan", "Shaurya", "Kian", "Advait", "Ansh", "Krish", "Rian", "Veer",
    "Dhruv", "Ayaan", "Ranveer", "Ekansh", "Zoravar", "Harsh",
]


def now():
    return datetime.now(timezone.utc)


def seed():
    with app.app_context():
        print("Dropping and recreating all tables...")
        db.drop_all()
        db.create_all()

        # ---------- Users ----------
        print("Creating users...")
        admin = User(name="Admin User", username="admin", email="admin@bgmitms.com", role="admin")
        admin.set_password("Admin@123")
        db.session.add(admin)

        captains = []
        captain_names = ["Rahul Sharma", "Aditya Verma", "Karan Mehta"]
        for i, name in enumerate(captain_names, start=1):
            cap = User(
                name=name,
                username=f"captain{i}",
                email=f"captain{i}@bgmitms.com",
                role="captain",
            )
            cap.set_password("Captain@123")
            captains.append(cap)
            db.session.add(cap)

        viewer = User(name="Guest Viewer", username="viewer", email="viewer@bgmitms.com", role="viewer")
        viewer.set_password("Viewer@123")
        db.session.add(viewer)

        db.session.flush()

        # ---------- Teams & Players ----------
        print("Creating teams and players...")
        # Extra captain-less users for teams beyond the 3 sample captain accounts
        extra_captains = []
        for i in range(4, 9):
            u = User(
                name=f"Captain {i}",
                username=f"captain{i}",
                email=f"captain{i}@bgmitms.com",
                role="captain",
            )
            u.set_password("Captain@123")
            extra_captains.append(u)
            db.session.add(u)
        db.session.flush()

        all_captains = captains + extra_captains
        teams = []
        for idx, team_name in enumerate(TEAM_NAMES):
            team = Team(
                name=team_name,
                tag=team_name.split()[0][:3].upper(),
                captain_id=all_captains[idx].id,
                logo_gradient=GRADIENTS[idx % len(GRADIENTS)],
                bio=f"{team_name} is a competitive BGMI roster known for aggressive rotations and clutch finishes.",
            )
            db.session.add(team)
            db.session.flush()

            used_names = random.sample(FIRST_NAMES, 5)
            for p_idx, pname in enumerate(used_names):
                player = Player(
                    team_id=team.id,
                    name=pname,
                    bgmi_id=str(random.randint(5000000000, 5999999999)),
                    ign=f"{team.tag}_{pname}",
                    is_substitute=(p_idx == 4),
                    role="substitute" if p_idx == 4 else "player",
                    kills=random.randint(10, 90),
                )
                db.session.add(player)
            teams.append(team)

        db.session.flush()

        # ---------- Tournaments ----------
        print("Creating tournaments...")
        t1 = Tournament(
            title="BGMI Winter Championship 2026",
            mode="squad",
            map="Erangel",
            entry_fee=0,
            prize_pool=500000,
            total_slots=8,
            start_date=now() + timedelta(days=10),
            registration_deadline=now() + timedelta(days=5),
            rules="Standard squad TPP rules. No teaming, no emulators, no third-party tools. Points-based scoring across 6 matches.",
            status="registration_open",
            created_by=admin.id,
        )
        t2 = Tournament(
            title="BGMI Pro League Season 4",
            mode="squad",
            map="Miramar",
            entry_fee=100,
            prize_pool=1000000,
            total_slots=8,
            start_date=now() - timedelta(days=3),
            registration_deadline=now() - timedelta(days=8),
            rules="Franchise-style league. Best of 6 matches across rotating maps. Top 4 advance to grand finals.",
            status="ongoing",
            created_by=admin.id,
        )
        db.session.add_all([t1, t2])
        db.session.flush()

        # ---------- Registrations ----------
        print("Creating registrations...")
        for team in teams:
            reg1 = TournamentRegistration(tournament_id=t1.id, team_id=team.id, status="approved", decided_by=admin.id, decided_at=now())
            reg2 = TournamentRegistration(tournament_id=t2.id, team_id=team.id, status="approved", decided_by=admin.id, decided_at=now())
            db.session.add_all([reg1, reg2])
        db.session.flush()

        # ---------- Matches for t2 (ongoing, has results) ----------
        print("Creating matches and results...")
        matches_t2 = []
        for i in range(1, 5):
            m = Match(
                tournament_id=t2.id,
                match_number=i,
                map=random.choice(MAPS),
                mode="squad",
                scheduled_time=now() - timedelta(days=3 - i, hours=2),
                room_id=f"{random.randint(100000, 999999)}",
                room_password=f"pw{random.randint(1000, 9999)}",
                reveal_minutes_before=30,
                status="completed",
            )
            db.session.add(m)
            matches_t2.append(m)

        # Upcoming match for t1
        m_upcoming = Match(
            tournament_id=t1.id,
            match_number=1,
            map="Erangel",
            mode="squad",
            scheduled_time=now() + timedelta(days=10, hours=1),
            room_id=f"{random.randint(100000, 999999)}",
            room_password=f"pw{random.randint(1000, 9999)}",
            reveal_minutes_before=30,
            status="scheduled",
        )
        db.session.add(m_upcoming)
        db.session.flush()

        # Results for each completed match in t2
        for m in matches_t2:
            shuffled_teams = teams.copy()
            random.shuffle(shuffled_teams)
            for placement, team in enumerate(shuffled_teams, start=1):
                result = MatchResult(
                    match_id=m.id,
                    team_id=team.id,
                    placement=placement,
                    finishes=random.randint(0, 12),
                )
                result.calculate_points()
                db.session.add(result)

        db.session.commit()

        # ---------- Leaderboards ----------
        print("Calculating leaderboards...")
        recalculate_leaderboard(t1.id)
        recalculate_leaderboard(t2.id)

        # ---------- Notifications ----------
        print("Creating notifications...")
        for cap in all_captains:
            n = Notification(
                user_id=cap.id,
                title="Welcome to BGMI TMS",
                message="Your captain account is ready. Register your team and join a tournament to get started.",
                type="info",
            )
            db.session.add(n)

        for team in teams:
            n = Notification(
                user_id=team.captain.id,
                title="Registration Approved",
                message=f"Your team '{team.name}' has been approved for BGMI Winter Championship 2026.",
                type="success",
            )
            db.session.add(n)

        db.session.commit()
        print("\nSeed complete!")
        print("=" * 50)
        print("Demo credentials:")
        print("  Admin    -> username: admin      password: Admin@123")
        print("  Captain  -> username: captain1   password: Captain@123")
        print("  Captain  -> username: captain2   password: Captain@123")
        print("  Captain  -> username: captain3   password: Captain@123")
        print("  Viewer   -> username: viewer     password: Viewer@123")
        print("=" * 50)


if __name__ == "__main__":
    seed()
