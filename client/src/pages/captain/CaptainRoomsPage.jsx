import { useEffect, useState } from 'react'
import { DoorOpen, Clock, Lock } from 'lucide-react'
import { registrationService, matchService } from '../../services/tournamentService'
import StatusBadge from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/States'

export default function CaptainRoomsPage() {
  const [approvedTournaments, setApprovedTournaments] = useState([])
  const [selected, setSelected] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    registrationService.list({ status: 'approved' }).then((res) => {
      setApprovedTournaments(res.data.registrations)
      if (res.data.registrations.length) setSelected(String(res.data.registrations[0].tournament_id))
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    matchService.listByTournament(selected).then((res) => setMatches(res.data.matches))
  }, [selected])

  if (loading) return <div className="skeleton h-64 w-full" />

  if (approvedTournaments.length === 0) {
    return <EmptyState icon={Lock} title="No approved tournaments yet" description="Room details unlock once your team registration is approved." />
  }

  return (
    <div>
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input-field !w-auto mb-6">
        {approvedTournaments.map((r) => <option key={r.tournament_id} value={r.tournament_id}>{r.tournament_title}</option>)}
      </select>

      {matches.length === 0 ? (
        <EmptyState icon={DoorOpen} title="No matches scheduled" description="Room details will appear here once matches are created." />
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <div key={m.id} className="glass-card p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-neon-green">
                    #{m.match_number}
                  </div>
                  <div>
                    <p className="font-medium text-slate-100">{m.map} · {m.mode.toUpperCase()}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {new Date(m.scheduled_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                {m.room_available && m.room_id ? (
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-sans">Room ID</p>
                      <p className="text-neon-green text-lg mt-0.5">{m.room_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-sans">Password</p>
                      <p className="text-neon-green text-lg mt-0.5">{m.room_password}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Lock className="h-4 w-4" /> Room details will be revealed {m.reveal_minutes_before} minutes before the match.
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
