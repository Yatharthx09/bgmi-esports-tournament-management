import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Users, Swords, Wallet, Plus, ArrowRight } from 'lucide-react'
import { analyticsService, tournamentService, registrationService } from '../../services/tournamentService'
import StatCard from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import { GridSkeleton } from '../../components/ui/Skeletons'

export default function AdminOverviewPage() {
  const [summary, setSummary] = useState(null)
  const [tournaments, setTournaments] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsService.summary(),
      tournamentService.list(),
      registrationService.list({ status: 'pending' }),
    ])
      .then(([s, t, r]) => {
        setSummary(s.data)
        setTournaments(t.data.tournaments.slice(0, 5))
        setPending(r.data.registrations.slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <GridSkeleton count={4} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Welcome back, Admin</h2>
          <p className="text-sm text-slate-400 mt-1">Here's what's happening across your tournaments.</p>
        </div>
        <Link to="/admin/tournaments" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New Tournament
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Tournaments" value={summary?.total_tournaments ?? 0} accent="green" />
        <StatCard icon={Users} label="Teams" value={summary?.total_teams ?? 0} accent="purple" />
        <StatCard icon={Swords} label="Matches" value={summary?.total_matches ?? 0} accent="blue" />
        <StatCard icon={Wallet} label="Prize Pool" value={`₹${Number(summary?.prize_pool ?? 0).toLocaleString('en-IN')}`} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Recent Tournaments</h3>
            <Link to="/admin/tournaments" className="text-xs text-neon-green flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {tournaments.length === 0 && <p className="text-sm text-slate-500 py-6 text-center">No tournaments yet.</p>}
            {tournaments.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-100">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.slots_filled}/{t.total_slots} teams</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Pending Approvals</h3>
            <Link to="/admin/teams" className="text-xs text-neon-green flex items-center gap-1 hover:underline">
              Review <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pending.length === 0 && <p className="text-sm text-slate-500 py-6 text-center">No pending requests. 🎉</p>}
            {pending.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-100">{r.team_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">wants to join {r.tournament_title}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
