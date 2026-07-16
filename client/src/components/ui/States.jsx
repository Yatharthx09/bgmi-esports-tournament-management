import { Inbox, AlertTriangle } from 'lucide-react'

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-display font-semibold text-slate-100">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-rose-400" />
      </div>
      <h3 className="text-lg font-display font-semibold text-slate-100">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1.5 max-w-sm">{description}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-5">
          Try again
        </button>
      )}
    </div>
  )
}
