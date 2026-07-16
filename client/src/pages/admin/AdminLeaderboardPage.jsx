import { useEffect, useState } from 'react'
import { Download, RefreshCw, Trophy } from 'lucide-react'
import { tournamentService, leaderboardService } from '../../services/tournamentService'
import { toast } from '../../context/ToastContext'
import TeamLogo from '../../components/ui/TeamLogo'
import { EmptyState } from '../../components/ui/States'

export default function AdminLeaderboardPage() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    tournamentService.list().then((res) => {
      setTournaments(res.data.tournaments)
      if (res.data.tournaments.length) setSelected(String(res.data.tournaments[0].id))
    })
  }, [])

  const load = () => {
    if (!selected) return
    setLoading(true)
    leaderboardService.get(selected).then((res) => setLeaderboard(res.data.leaderboard)).finally(() => setLoading(false))
  }
  useEffect(load, [selected]) // eslint-disable-line

  const recalc = async () => {
    setRecalculating(true)
    try {
      await leaderboardService.recalculate(selected)
      toast.success('Leaderboard recalculated')
      load()
    } catch {
      toast.error('Could not recalculate leaderboard')
    } finally {
      setRecalculating(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input-field !w-auto">
          {tournaments.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={recalc} disabled={recalculating} className="btn-secondary text-sm">
            <RefreshCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} /> Recalculate
          </button>
          {selected && (
            <a href={leaderboardService.exportUrl(selected)} className="btn-primary text-sm">
              <Download className="h-4 w-4" /> Export CSV
            </a>
          )}
        </div>
      </div>

      {loading && <div className="skeleton h-64 w-full" />}

      {!loading && leaderboard.length === 0 && (
        <EmptyState icon={Trophy} title="No leaderboard data" description="Enter match results to populate the leaderboard." />
      )}

      {!loading && leaderboard.length > 0 && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 text-xs uppercase">
                <th className="text-left p-4">Rank</th>
                <th className="text-left p-4">Team</th>
                <th className="text-center p-4">Matches</th>
                <th className="text-center p-4">Placement Pts</th>
                <th className="text-center p-4">Finish Pts</th>
                <th className="text-center p-4">Total</th>
                <th className="text-center p-4">🍗</th>
                <th className="text-center p-4">Finishes</th>
                <th className="text-center p-4">Avg Placement</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((e) => (
                <tr key={e.team_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4 font-display font-bold text-neon-green">#{e.rank}</td>
                  <td className="p-4 flex items-center gap-2">
                    <TeamLogo team={{ name: e.team_name, logo_gradient: e.team_logo_gradient }} size="sm" />
                    {e.team_name}
                  </td>
                  <td className="p-4 text-center">{e.matches_played}</td>
                  <td className="p-4 text-center">{e.placement_points}</td>
                  <td className="p-4 text-center">{e.finish_points}</td>
                  <td className="p-4 text-center font-bold text-white">{e.total_points}</td>
                  <td className="p-4 text-center">{e.chicken_dinners}</td>
                  <td className="p-4 text-center">{e.total_finishes}</td>
                  <td className="p-4 text-center">{e.average_placement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
