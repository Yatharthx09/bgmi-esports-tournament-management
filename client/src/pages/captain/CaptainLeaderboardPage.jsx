import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { registrationService, leaderboardService } from '../../services/tournamentService'
import { teamService } from '../../services/teamService'
import TeamLogo from '../../components/ui/TeamLogo'
import { EmptyState } from '../../components/ui/States'

export default function CaptainLeaderboardPage() {
  const [approvedTournaments, setApprovedTournaments] = useState([])
  const [selected, setSelected] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [myTeamId, setMyTeamId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([registrationService.list({ status: 'approved' }), teamService.myTeam()]).then(([regs, team]) => {
      setApprovedTournaments(regs.data.registrations)
      setMyTeamId(team.data.team?.id)
      if (regs.data.registrations.length) setSelected(String(regs.data.registrations[0].tournament_id))
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    leaderboardService.get(selected).then((res) => setLeaderboard(res.data.leaderboard))
  }, [selected])

  if (loading) return <div className="skeleton h-64 w-full" />

  if (approvedTournaments.length === 0) {
    return <EmptyState icon={Trophy} title="No leaderboard yet" description="Your team's standing will appear once you're approved for a tournament." />
  }

  return (
    <div>
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input-field !w-auto mb-6">
        {approvedTournaments.map((r) => <option key={r.tournament_id} value={r.tournament_id}>{r.tournament_title}</option>)}
      </select>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-500 text-xs uppercase">
              <th className="text-left p-4">Rank</th>
              <th className="text-left p-4">Team</th>
              <th className="text-center p-4">Matches</th>
              <th className="text-center p-4">Total Pts</th>
              <th className="text-center p-4">🍗</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((e) => (
              <tr key={e.team_id} className={`border-b border-white/5 ${e.team_id === myTeamId ? 'bg-neon-green/5' : ''}`}>
                <td className="p-4 font-display font-bold text-neon-green">#{e.rank}</td>
                <td className="p-4 flex items-center gap-2">
                  <TeamLogo team={{ name: e.team_name, logo_gradient: e.team_logo_gradient }} size="sm" />
                  {e.team_name} {e.team_id === myTeamId && <span className="text-xs text-neon-green ml-1">(You)</span>}
                </td>
                <td className="p-4 text-center">{e.matches_played}</td>
                <td className="p-4 text-center font-bold text-white">{e.total_points}</td>
                <td className="p-4 text-center">{e.chicken_dinners}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
