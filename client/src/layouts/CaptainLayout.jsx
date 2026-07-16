import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Shield, Trophy, ClipboardCheck, DoorOpen, BarChart3, UserCircle, X } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

const LINKS = [
  { to: '/captain', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/captain/team', label: 'My Team', icon: Shield },
  { to: '/captain/tournaments', label: 'Available Tournaments', icon: Trophy },
  { to: '/captain/registrations', label: 'My Registrations', icon: ClipboardCheck },
  { to: '/captain/rooms', label: 'Match Room Details', icon: DoorOpen },
  { to: '/captain/leaderboard', label: 'Team Leaderboard', icon: BarChart3 },
  { to: '/captain/profile', label: 'Profile Settings', icon: UserCircle },
]

const TITLES = {
  '/captain': 'Captain Dashboard',
  '/captain/team': 'My Team',
  '/captain/tournaments': 'Available Tournaments',
  '/captain/registrations': 'My Registrations',
  '/captain/rooms': 'Match Room Details',
  '/captain/leaderboard': 'Team Leaderboard',
  '/captain/profile': 'Profile Settings',
}

export default function CaptainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'Captain Dashboard'

  return (
    <div className="flex bg-ink-950 min-h-screen">
      <Sidebar links={LINKS} roleLabel="Team Captain" />
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-ink-900 border-r border-white/10 p-4">
            <button onClick={() => setMobileOpen(false)} className="mb-4 text-slate-300">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-1">
              {LINKS.map((l) => (
                <a key={l.to} href={l.to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5">
                  <l.icon className="h-4 w-4" /> {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
