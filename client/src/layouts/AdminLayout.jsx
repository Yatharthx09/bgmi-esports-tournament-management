import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Trophy, Users, DoorOpen, ClipboardList, BarChart3, UserCog, Settings, X,
} from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/tournaments', label: 'Tournaments', icon: Trophy },
  { to: '/admin/teams', label: 'Team Approvals', icon: Users },
  { to: '/admin/matches', label: 'Match Rooms', icon: DoorOpen },
  { to: '/admin/results', label: 'Result Entry', icon: ClipboardList },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: BarChart3 },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/users', label: 'User Management', icon: UserCog },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

const TITLES = {
  '/admin': 'Dashboard Overview',
  '/admin/tournaments': 'Tournament Management',
  '/admin/teams': 'Team Approvals',
  '/admin/matches': 'Match Room Management',
  '/admin/results': 'Result Entry',
  '/admin/leaderboard': 'Leaderboard Management',
  '/admin/analytics': 'Analytics',
  '/admin/users': 'User Management',
  '/admin/settings': 'Settings',
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'Admin Dashboard'

  return (
    <div className="flex bg-ink-950 min-h-screen">
      <Sidebar links={LINKS} roleLabel="Admin Console" />
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
