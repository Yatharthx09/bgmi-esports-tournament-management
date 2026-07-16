import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../context/ToastContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role: 'viewer' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.username || !form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Account created — welcome, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'captain' ? '/captain' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create account')
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
          <h1 className="text-2xl font-display font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-slate-400 mb-6">Join as a spectator or register to captain a team.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-text">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Rahul Sharma" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">Username</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-field" placeholder="rahul_x" />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@mail.com" />
              </div>
            </div>
            <div>
              <label className="label-text">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="label-text">I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'viewer', label: 'Viewer' },
                  { value: 'captain', label: 'Team Captain' },
                ].map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      form.role === r.value ? 'bg-neon-green/15 text-neon-green border-neon-green/30' : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account? <Link to="/login" className="text-neon-green hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
