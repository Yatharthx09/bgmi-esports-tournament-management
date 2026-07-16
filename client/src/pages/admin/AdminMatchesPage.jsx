import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, DoorOpen, Eye, EyeOff } from 'lucide-react'
import { tournamentService, matchService } from '../../services/tournamentService'
import { toast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/States'
import { RowSkeleton } from '../../components/ui/Skeletons'

const EMPTY_FORM = {
  match_number: 1, map: 'Erangel', mode: 'squad', scheduled_time: '',
  room_id: '', room_password: '', reveal_minutes_before: 30, status: 'scheduled',
}

export default function AdminMatchesPage() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [visibleIds, setVisibleIds] = useState({})

  useEffect(() => {
    tournamentService.list().then((res) => {
      setTournaments(res.data.tournaments)
      if (res.data.tournaments.length) setSelected(String(res.data.tournaments[0].id))
    })
  }, [])

  const load = () => {
    if (!selected) return
    setLoading(true)
    matchService.listByTournament(selected).then((res) => setMatches(res.data.matches)).finally(() => setLoading(false))
  }
  useEffect(load, [selected]) // eslint-disable-line

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, match_number: matches.length + 1 })
    setModalOpen(true)
  }

  const openEdit = async (m) => {
    const res = await matchService.get(m.id)
    const full = res.data.match
    setEditing(m)
    setForm({
      match_number: full.match_number, map: full.map, mode: full.mode,
      scheduled_time: full.scheduled_time?.slice(0, 16), room_id: full.room_id || '',
      room_password: full.room_password || '', reveal_minutes_before: full.reveal_minutes_before, status: full.status,
    })
    setModalOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.scheduled_time) {
      toast.error('Please set a scheduled time')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await matchService.update(editing.id, form)
        toast.success('Match updated')
      } else {
        await matchService.create({ ...form, tournament_id: Number(selected) })
        toast.success('Match created')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save match')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (m) => {
    if (!confirm(`Delete match #${m.match_number}?`)) return
    try {
      await matchService.remove(m.id)
      toast.success('Match deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete match')
    }
  }

  const toggleVisible = async (m) => {
    if (visibleIds[m.id]) {
      setVisibleIds((v) => ({ ...v, [m.id]: null }))
      return
    }
    const res = await matchService.get(m.id)
    setVisibleIds((v) => ({ ...v, [m.id]: res.data.match }))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input-field !w-auto">
          {tournaments.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New Match
        </button>
      </div>

      {loading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}</div>}

      {!loading && matches.length === 0 && (
        <EmptyState icon={DoorOpen} title="No matches yet" description="Create a match and set room details for this tournament." />
      )}

      {!loading && matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((m) => {
            const full = visibleIds[m.id]
            return (
              <div key={m.id} className="glass-card p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-neon-green">
                      #{m.match_number}
                    </div>
                    <div>
                      <p className="font-medium text-slate-100 text-sm">{m.map} · {m.mode.toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{new Date(m.scheduled_time).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={m.status} />
                    <button onClick={() => toggleVisible(m)} className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-neon-blue/40">
                      {full ? <EyeOff className="h-4 w-4 text-slate-300" /> : <Eye className="h-4 w-4 text-slate-300" />}
                    </button>
                    <button onClick={() => openEdit(m)} className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-neon-green/40">
                      <Edit2 className="h-3.5 w-3.5 text-slate-300" />
                    </button>
                    <button onClick={() => remove(m)} className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-rose-500/40">
                      <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                    </button>
                  </div>
                </div>
                {full && (
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 font-mono text-sm">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-sans">Room ID</p>
                      <p className="text-neon-green mt-0.5">{full.room_id || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-sans">Password</p>
                      <p className="text-neon-green mt-0.5">{full.room_password || '—'}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Match' : 'Create Match'}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Match Number</label>
              <input type="number" value={form.match_number} onChange={(e) => setForm({ ...form, match_number: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label-text">Mode</label>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="input-field">
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Map</label>
              <select value={form.map} onChange={(e) => setForm({ ...form, map: e.target.value })} className="input-field">
                {['Erangel', 'Miramar', 'Sanhok', 'Vikendi'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-text">Scheduled Time</label>
            <input type="datetime-local" value={form.scheduled_time} onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Room ID</label>
              <input value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })} className="input-field font-mono" placeholder="123456" />
            </div>
            <div>
              <label className="label-text">Room Password</label>
              <input value={form.room_password} onChange={(e) => setForm({ ...form, room_password: e.target.value })} className="input-field font-mono" placeholder="pw1234" />
            </div>
          </div>
          <div>
            <label className="label-text">Reveal Room (minutes before match)</label>
            <input type="number" value={form.reveal_minutes_before} onChange={(e) => setForm({ ...form, reveal_minutes_before: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Match'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
