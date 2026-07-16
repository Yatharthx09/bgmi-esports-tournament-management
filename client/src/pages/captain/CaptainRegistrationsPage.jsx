import { useEffect, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { registrationService } from '../../services/tournamentService'
import StatusBadge from '../../components/ui/StatusBadge'
import { RowSkeleton } from '../../components/ui/Skeletons'
import { EmptyState } from '../../components/ui/States'

export default function CaptainRegistrationsPage() {
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    registrationService.list().then((res) => setRegs(res.data.registrations)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}</div>

  if (regs.length === 0) {
    return <EmptyState icon={ClipboardCheck} title="No registrations yet" description="Join a tournament to see your registration status here." />
  }

  return (
    <div className="space-y-3">
      {regs.map((r) => (
        <div key={r.id} className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-medium text-slate-100 text-sm">{r.tournament_title}</p>
            <p className="text-xs text-slate-500 mt-0.5">Requested {new Date(r.requested_at).toLocaleDateString()}</p>
          </div>
          <StatusBadge status={r.status} />
        </div>
      ))}
    </div>
  )
}
