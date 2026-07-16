import { useEffect, useState } from 'react'
import { Trophy, Calendar, Users } from 'lucide-react'
import { tournamentService, registrationService } from '../../services/tournamentService'
import { toast } from '../../context/ToastContext'
import StatusBadge from '../../components/ui/StatusBadge'
import { GridSkeleton } from '../../components/ui/Skeletons'
import { EmptyState } from '../../components/ui/States'

export default function CaptainTournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [myRegs, setMyRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      tournamentService.list({ status: 'registration_open' }),
      tournamentService.list({ status: 'upcoming' }),
      registrationService.list(),
    ]).then(([open, upcoming, regs]) => {
      const combined = [...open.data.tournaments, ...upcoming.data.tournaments]
      setTournaments(combined)
      setMyRegs(regs.data.registrations)
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const join = async (t) => {
    setJoiningId(t.id)
    try {
      await registrationService.register({ tournament_id: t.id })
      toast.success('Registration request submitted!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not register')
    } finally {
      setJoiningId(null)
    }
  }

  const regStatusFor = (tournamentId) => myRegs.find((r) => r.tournament_id === tournamentId)?.status

  if (loading) return <GridSkeleton count={6} />

  if (tournaments.length === 0) {
    return <EmptyState icon={Trophy} title="No open tournaments" description="Check back soon for new tournaments to join." />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {tournaments.map((t) => {
        const regStatus = regStatusFor(t.id)
        return (
          <div key={t.id} className="glass-card-hover p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-neon-purple/40 to-neon-blue/30 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <StatusBadge status={t.status} />
            </div>
            <h3 className="font-display font-semibold text-white">{t.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{t.map} · {t.mode.toUpperCase()}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(t.start_date).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {t.slots_filled}/{t.total_slots}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-neon-green font-semibold text-sm">₹{Number(t.prize_pool).toLocaleString('en-IN')}</span>
              {regStatus ? (
                <StatusBadge status={regStatus} />
              ) : (
                <button onClick={() => join(t)} disabled={joiningId === t.id || t.slots_filled >= t.total_slots} className="btn-primary !px-4 !py-1.5 text-xs">
                  {joiningId === t.id ? 'Joining...' : t.slots_filled >= t.total_slots ? 'Full' : 'Join'}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
