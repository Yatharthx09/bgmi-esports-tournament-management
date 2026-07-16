import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Trophy, Users, Swords, Wallet, Crosshair, MapPin } from 'lucide-react'
import { tournamentService, analyticsService } from '../../services/tournamentService'
import StatCard from '../../components/dashboard/StatCard'

const COLORS = ['#39ff88', '#a855f7', '#38bdf8', '#fb923c', '#f472b6', '#facc15']

export default function AdminAnalyticsPage() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState('')
  const [summary, setSummary] = useState(null)
  const [regSeries, setRegSeries] = useState([])
  const [topTeams, setTopTeams] = useState([])
  const [pointsBreakdown, setPointsBreakdown] = useState([])
  const [matchTrend, setMatchTrend] = useState([])
  const [topPlayers, setTopPlayers] = useState([])
  const [mapPerf, setMapPerf] = useState([])

  useEffect(() => {
    tournamentService.list().then((res) => {
      setTournaments(res.data.tournaments)
      if (res.data.tournaments.length) setSelected(String(res.data.tournaments[0].id))
    })
  }, [])

  useEffect(() => {
    const params = selected ? { tournament_id: selected } : {}
    analyticsService.summary(params).then((r) => setSummary(r.data))
    analyticsService.registrationsOverTime(params).then((r) => setRegSeries(r.data.series))
    analyticsService.topTeams(params).then((r) => setTopTeams(r.data.teams))
    analyticsService.pointsBreakdown(params).then((r) => setPointsBreakdown(r.data.teams))
    analyticsService.matchTrend(params).then((r) => setMatchTrend(r.data.series))
    analyticsService.topPlayers({ limit: 8 }).then((r) => setTopPlayers(r.data.players))
    analyticsService.mapPerformance(params).then((r) => setMapPerf(r.data.maps))
  }, [selected])

  return (
    <div className="space-y-6">
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input-field !w-auto">
        <option value="">All Tournaments</option>
        {tournaments.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
      </select>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Teams" value={summary?.total_teams ?? 0} accent="green" />
        <StatCard icon={Swords} label="Matches" value={summary?.total_matches ?? 0} accent="blue" />
        <StatCard icon={Wallet} label="Prize Pool" value={`₹${Number(summary?.prize_pool ?? 0).toLocaleString('en-IN')}`} accent="purple" />
        <StatCard icon={Crosshair} label="Total Finishes" value={summary?.total_finishes ?? 0} accent="green" />
        <StatCard icon={Trophy} label="Avg Points" value={summary?.average_points ?? 0} accent="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-4">Registrations Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={regSeries}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="cumulative" stroke="#39ff88" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-4">Top 10 Teams by Points</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topTeams} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="team_name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="total_points" fill="#a855f7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-4">Placement vs Finish Points</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pointsBreakdown}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="team_name" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="placement_points" stackId="a" fill="#39ff88" name="Placement Pts" />
              <Bar dataKey="finish_points" stackId="a" fill="#38bdf8" name="Finish Pts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-4">Match-wise Points Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={matchTrend}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="match" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="total_points" stroke="#38bdf8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><Crosshair className="h-4 w-4 text-neon-green" /> Most Finishes by Player</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topPlayers} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0d121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="kills" fill="#f472b6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-neon-green" /> Map-wise Performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={mapPerf} dataKey="matches" nameKey="map" cx="50%" cy="50%" outerRadius={90} label>
                {mapPerf.map((entry, index) => (
                  <Cell key={entry.map} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
