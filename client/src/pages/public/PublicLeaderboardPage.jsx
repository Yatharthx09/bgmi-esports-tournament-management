import { useEffect, useState } from 'react'
import { Download, Trophy } from 'lucide-react'
import { tournamentService, leaderboardService } from '../../services/tournamentService'
import TeamLogo from '../../components/ui/TeamLogo'
import { EmptyState } from '../../components/ui/States'

export default function PublicLeaderboardPage() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    tournamentService.list().then((res) => {
      setTournaments(res.data.tournaments)
      const active = res.data.tournaments.find((t) => t.status === 'ongoing') || res.data.tournaments[0]
      if (active) setSelected(String(active.id))
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    leaderboardService.get(selected).then((res) => setLeaderboard(res.data.leaderboard)).finally(() => setLoading(false))
  }, [selected])

  const podium = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <span className="section-eyebrow">Standings</span>
          <h1 className="text-3xl font-bold text-white mt-1">Leaderboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input-field !w-auto">
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          {selected && (
            <a href={leaderboardService.exportUrl(selected)} className="btn-secondary !px-4 !py-2.5 text-sm">
              <Download className="h-4 w-4" /> CSV
            </a>
          )}
        </div>
      </div>

      {loading && <div className="skeleton h-64 w-full" />}

      {!loading && leaderboard.length === 0 && (
        <EmptyState icon={Trophy} title="No standings yet" description="Results will appear here once matches are played." />
      )}

      {!loading && leaderboard.length > 0 && (
        <>
          {/* Podium */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-10 items-end">
            {[podium[1], podium[0], podium[2]].map((e, idx) =>
              e ? (
                <div
                  key={e.team_id}
                  className={`glass-card-hover text-center p-5 ${idx === 1 ? 'pb-8 border-neon-green/40 shadow-glow' : 'pb-5 opacity-90'}`}
                  style={{ order: idx === 1 ? 2 : idx === 0 ? 1 : 3 }}
                >
                  <div className="flex justify-center mb-3">
                    <TeamLogo team={{ name: e.team_name, logo_gradient: e.team_logo_gradient }} size={idx === 1 ? 'lg' : 'md'} />
                  </div>
                  <p className="text-3xl mb-1">{idx === 1 ? '🥇' : idx === 0 ? '🥈' : '🥉'}</p>
                  <p className="font-display font-semibold text-white truncate">{e.team_name}</p>
                  <p className="text-neon-green font-bold text-lg mt-1">{e.total_points} pts</p>
                </div>
              ) : <div key={idx} />
            )}
          </div>

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
                {rest.map((e) => (
                  <tr key={e.team_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 font-display font-bold text-slate-400">#{e.rank}</td>
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
        </>
      )}
    </div>
  )
}
