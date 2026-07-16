<div align="center">

# 🏆 BGMI Tournament Management System

### A full-stack esports tournament operations platform for competitive BGMI

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

**BGMI Tournament Management System (BGMI-TMS)** is a full-stack web application for organizing and running
competitive BGMI (Battlegrounds Mobile India) esports tournaments — from team registration and admin approval,
to match room management with timed credential reveal, live scoring, and real-time leaderboards.

It was built as a **BTech final-year engineering project**, designed with the same architectural patterns used in
production tournament platforms: a REST API backend, role-based access control, JWT authentication, and a
dark-themed, glassmorphic esports dashboard on the frontend.

> ⚠️ This is an independent, fan-built project and is **not affiliated with or endorsed by KRAFTON** or the
> Battlegrounds Mobile India franchise. All team names used in seed data are for demonstration purposes only.

---

## ✨ Key Features

- 🔐 **JWT authentication** with three roles — **Admin**, **Team Captain**, and **Viewer**
- 🏆 **Tournament management** — create, edit, and track tournaments through their full lifecycle
- 🛡️ **Team & roster management** — 4 starters + 1 substitute, with BGMI ID verification
- ✅ **Registration approval workflow** — captains apply, admins approve/reject with automatic notifications
- 🚪 **Match room management** with **timed credential reveal** — room ID/password hidden until X minutes before kickoff
- 📊 **Automatic scoring engine** — placement points + finish points, calculated and ranked instantly
- 🥇 **Live leaderboard** with podium styling, CSV export, and per-tournament standings
- 📈 **Analytics dashboard** — registrations over time, top teams, points breakdown, match trends, map performance
- 🔔 **Notifications** for registration decisions and account updates
- 💎 **Premium dark UI** — glassmorphism, neon accents, Framer Motion transitions, fully responsive

---

## 📸 Screenshots

> _Add screenshots of your running app here before publishing._

| Landing Page | Admin Dashboard | Leaderboard |
|---|---|---|
| `screenshots/landing.png` | `screenshots/admin-dashboard.png` | `screenshots/leaderboard.png` |

| Tournament Details | Result Entry | Analytics |
|---|---|---|
| `screenshots/tournament-details.png` | `screenshots/result-entry.png` | `screenshots/analytics.png` |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS (custom dark esports theme)
- Framer Motion — animations & transitions
- React Router 6
- Recharts — analytics charts
- Axios — API client
- Lucide React — icons
- react-hot-toast — notifications

**Backend**
- Python 3 + Flask (application factory pattern)
- Flask-SQLAlchemy — ORM
- SQLite — local development database
- Flask-JWT-Extended — JWT authentication
- Flask-CORS
- Werkzeug — password hashing

---

## 📁 Folder Structure

```
bgmi-tournament-management-system/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # Buttons, badges, modals, skeletons, empty/error states
│   │   │   ├── layout/             # Navbar, Footer, Sidebar, Topbar
│   │   │   └── dashboard/          # StatCard and dashboard widgets
│   │   ├── pages/
│   │   │   ├── public/             # Landing, tournaments, leaderboard, about, contact
│   │   │   ├── auth/                # Login, register
│   │   │   ├── admin/               # Admin dashboard pages
│   │   │   └── captain/             # Captain dashboard pages
│   │   ├── layouts/                # PublicLayout, AdminLayout, CaptainLayout
│   │   ├── context/                 # AuthContext, ToastContext
│   │   ├── services/                 # Axios API service modules
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── server/                        # Flask backend
│   ├── app/
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── routes/                  # Blueprints / REST endpoints
│   │   ├── services/                 # Leaderboard calculation, CSV export
│   │   ├── utils/                    # Validators, response helpers
│   │   └── middleware/               # Role-based access decorators
│   ├── config.py
│   ├── run.py
│   ├── seed.py                     # Demo data seeder
│   └── requirements.txt
├── README.md
├── .gitignore
└── LICENSE
```

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/bgmi-tournament-management-system.git
cd bgmi-tournament-management-system
```

### 2. Backend setup

```bash
cd server
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env            # then edit .env with your own secrets

python seed.py                  # creates the database and loads demo data
python run.py                   # starts the API on http://localhost:5000
```

### 3. Frontend setup

Open a new terminal:

```bash
cd client
npm install

cp .env.example .env            # defaults to http://localhost:5000/api

npm run dev                     # starts the app on http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables

**server/.env**

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Flask secret key | `dev-secret-key` |
| `JWT_SECRET_KEY` | JWT signing key | `dev-jwt-secret-key` |
| `DATABASE_URL` | SQLAlchemy database URI | `sqlite:///bgmi_tms.db` |
| `JWT_ACCESS_TOKEN_EXPIRES_HOURS` | Token lifetime in hours | `24` |
| `ROOM_REVEAL_MINUTES_BEFORE` | Default room reveal window | `30` |
| `CORS_ORIGINS` | Allowed frontend origin(s) | `http://localhost:5173` |

**client/.env**

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 👤 Demo Credentials

After running `python seed.py`:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin@123` |
| Captain | `captain1` | `Captain@123` |
| Captain | `captain2` | `Captain@123` |
| Captain | `captain3` | `Captain@123` |
| Viewer | `viewer` | `Viewer@123` |

The seed script also creates 8 teams (5 players each), 2 tournaments, multiple matches with results, a live
leaderboard, and sample notifications.

---

## 📡 API Documentation Summary

Base URL: `http://localhost:5000/api`

| Module | Base Route | Notes |
|---|---|---|
| Auth | `/auth` | `register`, `login`, `me`, `profile` |
| Users | `/users` | Admin-only user management |
| Teams | `/teams` | CRUD + `my-team` |
| Players | `/players` | Roster management |
| Tournaments | `/tournaments` | CRUD |
| Registrations | `/registrations` | Apply, approve/reject, cancel |
| Matches | `/matches` | CRUD + timed room reveal |
| Results | `/results` | Single & bulk result entry, auto-scoring |
| Leaderboard | `/leaderboard` | Get, recalculate, CSV export |
| Analytics | `/analytics` | Summary + chart data endpoints |
| Notifications | `/notifications` | List, mark read |

All endpoints return structured JSON:

```json
{ "success": true, "message": "...", "data": { } }
```

Protected routes require an `Authorization: Bearer <token>` header obtained from `/auth/login`.

---

## 🧮 Scoring System

| Placement | Points |
|---|---|
| 🥇 1st | 15 |
| 🥈 2nd | 12 |
| 🥉 3rd | 10 |
| 4th | 8 |
| 5th | 6 |
| 6th | 4 |
| 7th | 2 |
| 8th – 16th | 1 |
| Each finish (kill) | +1 |

**Total Points = Placement Points + Finish Points**

Leaderboards are recalculated automatically whenever a match result is entered, edited, or deleted, ranking teams by
total points, then chicken dinners, then average placement.

---

## 🗺️ Roadmap / Future Improvements

- [ ] WebSocket-based live leaderboard updates during matches
- [ ] In-app team chat and match-day announcements
- [ ] Bracket/playoff visualization for knockout stages
- [ ] Payment gateway integration for paid entry tournaments
- [ ] Discord bot integration for room ID auto-DM
- [ ] Mobile app (React Native) companion
- [ ] PostgreSQL support for production deployments

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please keep PRs focused and include a clear description of the change.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Developer

Built as a BTech first-year project.

- **Project**: BGMI Tournament Management System
- **Contact**: support@bgmitms.com

If this project helped you, consider giving it a ⭐ on GitHub!
