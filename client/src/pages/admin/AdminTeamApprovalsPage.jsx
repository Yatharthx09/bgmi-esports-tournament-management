import { useEffect, useState } from 'react'
import { Check, X, Users } from 'lucide-react'
import { tournamentService, registrationService } from '../../services/tournamentService'
import { toast } from '../../context/ToastContext'
import TeamLogo from '../../components/ui/TeamLogo'
import StatusBadge from '../../components/ui/StatusBadge'
import { RowSkeleton } from '../../components/ui/Skeletons'
import { EmptyState } from '../../components/ui/States'

export default function AdminTeamApprovalsPage() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState('')
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')

  useEffect(() => {
    tournamentService.list().then((res) => {
      setTournaments(res.data.tournaments)
      if (res.data.tournaments.length) setSelected(String(res.data.tournaments[0].id))
    })
  }, [])

  const load = () => {
    setLoading(true)
    registrationService
      .list({ tournament_id: selected || undefined, status: statusFilter || undefined })
      .then((res) => setRegs(res.data.registrations))
      .finally(() => setLoading(false))
  }
  useEffect(() => { if (selected) load() }, [selected, statusFilter]) // eslint-disable-line

  const decide = async (reg, status) => {
    try {
      await registrationService.decide(reg.id, status)
      toast.success(`Team ${status}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update registration')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input-field !w-auto">
          {tournaments.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', ''].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                statusFilter === s ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>}

      {!loading && regs.length === 0 && (
        <EmptyState icon={Users} title="No registrations" description="No team registrations match this filter." />
      )}

      {!loading && regs.length > 0 && (
        <div className="space-y-3">
          {regs.map((r) => (
            <div key={r.id} className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <TeamLogo team={{ name: r.team_name, logo_gradient: r.team_logo_gradient }} />
                <div>
                  <p className="font-medium text-slate-100 text-sm">{r.team_name}</p>
                  <p className="text-xs text-slate-500">{r.tournament_title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={r.status} />
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => decide(r, 'approved')} className="h-9 w-9 rounded-lg bg-neon-green/15 border border-neon-green/30 flex items-center justify-center hover:bg-neon-green/25">
                      <Check className="h-4 w-4 text-neon-green" />
                    </button>
                    <button onClick={() => decide(r, 'rejected')} className="h-9 w-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center hover:bg-rose-500/25">
                      <X className="h-4 w-4 text-rose-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
