import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../context/ToastContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.identifier || !form.password) {
      toast.error('Please enter your username/email and password')
      return
    }
    setLoading(true)
    try {
      const user = await login(form.identifier, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      const dest = location.state?.from || (user.role === 'admin' ? '/admin' : user.role === 'captain' ? '/captain' : '/')
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_30%,#000_50%,transparent_100%)]" />
      <div className="w-full max-w-md relative">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
            <Trophy className="h-5 w-5 text-ink-950" />
          </div>
          <span className="font-display font-bold text-xl text-white">
            BGMI<span className="text-neon-green">TMS</span>
          </span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-display font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-6">Log in to manage your tournaments.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-text">Username or Email</label>
              <input
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                className="input-field"
                placeholder="admin or admin@bgmitms.com"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account? <Link to="/register" className="text-neon-green hover:underline">Sign up</Link>
          </p>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 mb-2">Demo credentials</p>
            <div className="text-xs text-slate-400 space-y-1 font-mono">
              <p>admin / Admin@123</p>
              <p>captain1 / Captain@123</p>
              <p>viewer / Viewer@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
