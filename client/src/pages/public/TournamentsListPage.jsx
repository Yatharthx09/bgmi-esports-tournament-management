import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trophy, Calendar, Users } from 'lucide-react'
import { tournamentService } from '../../services/tournamentService'
import { GridSkeleton } from '../../components/ui/Skeletons'
import { EmptyState, ErrorState } from '../../components/ui/States'
import StatusBadge from '../../components/ui/StatusBadge'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'registration_open', label: 'Registration Open' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
]

export default function TournamentsListPage() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    setError(false)
    tournamentService
      .list({ status: status || undefined, search: search || undefined })
      .then((res) => setTournaments(res.data.tournaments))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Compete</span>
        <h1 className="text-3xl font-bold text-white mt-1">Tournaments</h1>
        <p className="text-slate-400 mt-2">Browse open brackets, check prize pools, and lock in your squad's slot.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tournaments..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                status === f.value ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <GridSkeleton count={6} />}
      {!loading && error && <ErrorState description="Couldn't load tournaments right now." onRetry={load} />}
      {!loading && !error && tournaments.length === 0 && (
        <EmptyState icon={Trophy} title="No tournaments found" description="Try a different filter or check back soon for new brackets." />
      )}
      {!loading && !error && tournaments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tournaments.map((t) => (
            <Link key={t.id} to={`/tournaments/${t.id}`} className="glass-card-hover p-5 block">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-neon-purple/40 to-neon-blue/30 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <StatusBadge status={t.status} />
              </div>
              <h3 className="font-display font-semibold text-white text-lg">{t.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{t.map} · {t.mode.toUpperCase()}</p>

              <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(t.start_date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {t.slots_filled}/{t.total_slots}</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-neon-green font-display font-bold">₹{Number(t.prize_pool).toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-500">{t.entry_fee > 0 ? `₹${t.entry_fee} entry` : 'Free entry'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
