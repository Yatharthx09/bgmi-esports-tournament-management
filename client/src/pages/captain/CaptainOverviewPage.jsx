import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Trophy, ClipboardCheck, ArrowRight } from 'lucide-react'
import { teamService } from '../../services/teamService'
import { registrationService as regSvc } from '../../services/tournamentService'
import TeamLogo from '../../components/ui/TeamLogo'
import StatusBadge from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/States'

export default function CaptainOverviewPage() {
  const [team, setTeam] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    teamService.myTeam().then((res) => {
      setTeam(res.data.team)
      if (res.data.team) {
        regSvc.list({ team_id: res.data.team.id }).then((r) => setRegistrations(r.data.registrations))
      }
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="skeleton h-64 w-full" />

  if (!team) {
    return (
      <EmptyState
        icon={Shield}
        title="You haven't registered a team yet"
        description="Register your squad to start joining tournaments."
        action={<Link to="/captain/team" className="btn-primary">Register Team</Link>}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <TeamLogo team={team} size="lg" />
          <div>
            <h2 className="text-xl font-display font-bold text-white">{team.name}</h2>
            <p className="text-sm text-slate-400 mt-1">{team.player_count} players registered</p>
          </div>
        </div>
        <Link to="/captain/team" className="btn-secondary text-sm">Manage Roster</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-neon-green" /> My Registrations
            </h3>
            <Link to="/captain/registrations" className="text-xs text-neon-green flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {registrations.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No tournament registrations yet.</p>
          ) : (
            <div className="space-y-3">
              {registrations.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <p className="text-sm text-slate-200">{r.tournament_title}</p>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-neon-green" /> Find New Tournaments
          </h3>
          <p className="text-sm text-slate-400 mb-4">Browse open tournaments and lock in your squad's slot before registration closes.</p>
          <Link to="/captain/tournaments" className="btn-primary text-sm">
            Browse Tournaments <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
