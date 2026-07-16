import { useState, useEffect, useRef } from 'react'
import { Bell, Menu, LogOut, User as UserIcon, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../../services/tournamentService'
import TeamLogo from '../ui/TeamLogo'

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    notificationService
      .list()
      .then((res) => {
        setNotifications(res.data.notifications)
        setUnread(res.data.unread_count)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    await notificationService.markAllRead()
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })))
    setUnread(0)
  }

  return (
    <header className="h-16 border-b border-white/10 bg-ink-900/50 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-slate-300" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display font-semibold text-white text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-neon-green/40 transition-colors"
          >
            <Bell className="h-[18px] w-[18px] text-slate-300" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-[18px] w-[18px] min-w-[18px] px-1 rounded-full bg-rose-500 text-[10px] flex items-center justify-center text-white font-bold">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-card p-2 shadow-2xl border-white/15">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="font-display font-semibold text-sm text-white">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-neon-green flex items-center gap-1 hover:underline">
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin space-y-1">
                {notifications.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-6">You're all caught up.</p>
                )}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-3 py-2.5 rounded-lg text-sm ${n.is_read ? 'opacity-60' : 'bg-white/5'}`}
                  >
                    <p className="font-medium text-slate-100">{n.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2">
            <TeamLogo team={{ name: user?.name, logo_gradient: 'from-neon-purple to-neon-blue' }} size="sm" />
            <span className="hidden sm:block text-sm text-slate-200 font-medium">{user?.name}</span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-card p-2 shadow-2xl border-white/15">
              <button
                onClick={() => {
                  setProfileOpen(false)
                  navigate(user.role === 'admin' ? '/admin/settings' : '/captain/profile')
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5"
              >
                <UserIcon className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
