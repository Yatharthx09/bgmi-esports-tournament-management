import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, Calendar, Users, Wallet, MapPin, Clock, ShieldCheck } from 'lucide-react'
import { tournamentService, matchService, leaderboardService, registrationService } from '../../services/tournamentService'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../context/ToastContext'
import StatusBadge from '../../components/ui/StatusBadge'
import TeamLogo from '../../components/ui/TeamLogo'
import { ErrorState } from '../../components/ui/States'

const TABS = ['Overview', 'Teams', 'Matches', 'Leaderboard', 'Rules']

export default function TournamentDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [matches, setMatches] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [tab, setTab] = useState('Overview')
  const [error, setError] = useState(false)
  const [joining, setJoining] = useState(false)

  const load = () => {
    setError(false)
    tournamentService.get(id).then((res) => setTournament(res.data.tournament)).catch(() => setError(true))
    matchService.listByTournament(id).then((res) => setMatches(res.data.matches)).catch(() => {})
    leaderboardService.get(id).then((res) => setLeaderboard(res.data.leaderboard)).catch(() => {})
  }

  useEffect(load, [id])

  const handleJoin = async () => {
    if (!user) return navigate('/login')
    if (user.role !== 'captain') return toast.error('Only team captains can register for tournaments')
    setJoining(true)
    try {
      await registrationService.register({ tournament_id: Number(id) })
      toast.success('Registration request submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not register')
    } finally {
      setJoining(false)
    }
  }

  if (error) return <div className="max-w-5xl mx-auto px-4 py-16"><ErrorState onRetry={load} /></div>
  if (!tournament) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="skeleton h-48 w-full mb-6" />
        <div className="skeleton h-6 w-1/2 mb-3" />
        <div className="skeleton h-4 w-1/3" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden h-56 sm:h-72 bg-gradient-to-br from-neon-purple/30 via-neon-blue/20 to-ink-900 border border-white/10 flex items-end p-6 sm:p-8 mb-8">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-20" />
        <div className="relative flex items-end justify-between w-full flex-wrap gap-4">
          <div>
            <StatusBadge status={tournament.status} />
            <h1 className="text-2xl sm:text-4xl font-bold text-white mt-3">{tournament.title}</h1>
            <p className="text-slate-300 mt-1">{tournament.map} · {tournament.mode.toUpperCase()}</p>
          </div>
          {(tournament.status === 'upcoming' || tournament.status === 'registration_open') && (
            <button onClick={handleJoin} disabled={joining} className="btn-primary">
              {joining ? 'Submitting...' : 'Join Tournament'}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Wallet, label: 'Prize Pool', value: `₹${Number(tournament.prize_pool).toLocaleString('en-IN')}` },
          { icon: Users, label: 'Slots', value: `${tournament.slots_filled}/${tournament.total_slots}` },
          { icon: Calendar, label: 'Start Date', value: new Date(tournament.start_date).toLocaleDateString() },
          { icon: MapPin, label: 'Map', value: tournament.map },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <s.icon className="h-4 w-4 text-neon-green mb-2" />
            <p className="text-lg font-display font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 mb-6 overflow-x-auto scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-display font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t ? 'border-neon-green text-neon-green' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-3">About this tournament</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {tournament.rules?.slice(0, 240) || 'Details for this tournament will be published soon.'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-xs text-slate-500 uppercase">Registration Deadline</p>
              <p className="text-slate-200 mt-1">{new Date(tournament.registration_deadline).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Entry Fee</p>
              <p className="text-slate-200 mt-1">{tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Matches Scheduled</p>
              <p className="text-slate-200 mt-1">{tournament.match_count}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'Teams' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaderboard.length === 0 ? (
            <p className="text-slate-500 col-span-full text-center py-10">No teams have joined yet.</p>
          ) : (
            leaderboard.map((e) => (
              <div key={e.team_id} className="glass-card p-4 flex items-center gap-3">
                <TeamLogo team={{ name: e.team_name, logo_gradient: e.team_logo_gradient }} />
                <div>
                  <p className="font-medium text-white text-sm">{e.team_name}</p>
                  <p className="text-xs text-slate-500">{e.matches_played} matches played</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'Matches' && (
        <div className="space-y-3">
          {matches.length === 0 ? (
            <p className="text-slate-500 text-center py-10">No matches scheduled yet.</p>
          ) : (
            matches.map((m) => (
              <div key={m.id} className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-neon-green">
                    #{m.match_number}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{m.map} · {m.mode.toUpperCase()}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {new Date(m.scheduled_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'Leaderboard' && (
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
                <th className="text-center p-4">🍗 Dinners</th>
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
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No leaderboard data yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Rules' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-neon-green" />
            <h3 className="font-display font-semibold text-white">Tournament Rules</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
            {tournament.rules || 'Rules have not been published for this tournament yet.'}
          </p>
        </div>
      )}
    </div>
  )
}
