import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Users, Radio, BarChart3, ShieldCheck, Zap, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { tournamentService, analyticsService } from '../../services/tournamentService'

const FEATURES = [
  { icon: Trophy, title: 'Tournament Ops', desc: 'Create brackets, set entry fees and prize pools, and manage registration windows end to end.' },
  { icon: Radio, title: 'Room Control', desc: 'Room IDs and passwords stay hidden until minutes before the drop — visible only to approved teams.' },
  { icon: Users, title: 'Roster Management', desc: 'Four starters, one substitute, verified BGMI IDs. Approvals flow straight to the captain.' },
  { icon: BarChart3, title: 'Live Standings', desc: 'Placement points, finish points, chicken dinners — recalculated the instant a result is entered.' },
  { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Admins, captains, and viewers each see exactly what they need — nothing more.' },
  { icon: Zap, title: 'Built for Match Day', desc: 'A dashboard fast enough to run during a live tournament, not just plan one.' },
]

export default function LandingPage() {
  const [tournaments, setTournaments] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    tournamentService.list({ status: 'registration_open' }).then((res) => setTournaments(res.data.tournaments.slice(0, 3))).catch(() => {})
    analyticsService.summary().then((res) => setSummary(res.data)).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="section-eyebrow">Tournament Operating System</span>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mt-4 leading-[1.05]">
              Run your BGMI tournament like a <span className="gradient-text">championship server</span>.
            </h1>
            <p className="text-slate-400 text-lg mt-5 max-w-xl">
              From team approvals to the final chicken dinner — manage rosters, match rooms, live scoring and
              leaderboards in one command center.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/tournaments" className="btn-primary">
                Browse Tournaments <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn-secondary">
                Register Your Team
              </Link>
            </div>
          </motion.div>

          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16"
            >
              {[
                { label: 'Tournaments', value: summary.total_tournaments },
                { label: 'Teams', value: summary.total_teams },
                { label: 'Matches Played', value: summary.total_matches },
                { label: 'Total Prize Pool', value: `₹${Number(summary.prize_pool).toLocaleString('en-IN')}` },
              ].map((s) => (
                <div key={s.label} className="glass-card p-4 text-center">
                  <p className="text-2xl font-display font-bold text-neon-green">{s.value}</p>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Live/Open tournaments */}
      {tournaments.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="section-eyebrow">Open Now</span>
              <h2 className="text-2xl font-bold text-white mt-1">Registration Open</h2>
            </div>
            <Link to="/tournaments" className="text-sm text-neon-green hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t) => (
              <Link key={t.id} to={`/tournaments/${t.id}`} className="glass-card-hover p-5 block">
                <div className="h-32 rounded-xl bg-gradient-to-br from-neon-purple/30 via-neon-blue/20 to-transparent mb-4 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-white/70" />
                </div>
                <h3 className="font-display font-semibold text-white">{t.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{t.map} · {t.mode.toUpperCase()}</p>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-neon-green font-semibold">₹{Number(t.prize_pool).toLocaleString('en-IN')}</span>
                  <span className="text-slate-500">{t.slots_filled}/{t.total_slots} slots</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <span className="section-eyebrow">What you get</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-10">Everything to run tournament day</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card-hover p-6">
              <div className="h-11 w-11 rounded-xl bg-neon-green/10 border border-neon-green/25 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-neon-green" />
              </div>
              <h3 className="font-display font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="glass-card p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-purple/10" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-3">Ready to drop in?</h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-8">
              Register your squad, get approved, and receive room details straight to your dashboard.
            </p>
            <Link to="/register" className="btn-primary">
              Create Your Account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
