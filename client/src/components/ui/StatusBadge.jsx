const STYLES = {
  upcoming: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
  registration_open: 'bg-neon-green/15 text-neon-green border border-neon-green/30',
  ongoing: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  completed: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
  scheduled: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
  live: 'bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse-slow',
  pending: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  approved: 'bg-neon-green/15 text-neon-green border border-neon-green/30',
  rejected: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
}

const LABELS = {
  upcoming: 'Upcoming',
  registration_open: 'Registration Open',
  ongoing: 'Ongoing',
  completed: 'Completed',
  scheduled: 'Scheduled',
  live: 'Live',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${STYLES[status] || 'bg-white/10 text-slate-300 border border-white/10'}`}>
      {status === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
      {LABELS[status] || status}
    </span>
  )
}
