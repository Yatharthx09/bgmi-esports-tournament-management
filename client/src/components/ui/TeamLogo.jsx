export default function TeamLogo({ team, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-16 w-16 text-lg',
  }
  const initials = (team?.tag || team?.name || '??').slice(0, 3).toUpperCase()
  if (team?.logo_url) {
    return (
      <img
        src={team.logo_url}
        alt={team.name}
        className={`${sizes[size]} rounded-xl object-cover border border-white/10`}
      />
    )
  }
  return (
    <div
      className={`${sizes[size]} rounded-xl bg-gradient-to-br ${team?.logo_gradient || 'from-emerald-400 to-cyan-500'} flex items-center justify-center font-display font-bold text-ink-950 shrink-0`}
    >
      {initials}
    </div>
  )
}
