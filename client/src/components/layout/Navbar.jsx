import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Trophy, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'captain' ? '/captain' : null

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
            <Trophy className="h-5 w-5 text-ink-950" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide text-white">
            BGMI<span className="text-neon-green">TMS</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-neon-green bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {dashboardPath && (
                <button onClick={() => navigate(dashboardPath)} className="btn-secondary !px-4 !py-2 text-sm">
                  Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden text-slate-300" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-ink-950/95 px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-white/10 mt-3 flex flex-col gap-2">
            {user ? (
              <>
                {dashboardPath && (
                  <button onClick={() => navigate(dashboardPath)} className="btn-secondary w-full text-sm">
                    Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="btn-danger w-full text-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary w-full text-sm text-center">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary w-full text-sm text-center">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
