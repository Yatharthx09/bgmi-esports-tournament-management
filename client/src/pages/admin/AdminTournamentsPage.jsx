import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Trophy, Calendar } from 'lucide-react'
import { tournamentService } from '../../services/tournamentService'
import { toast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { GridSkeleton } from '../../components/ui/Skeletons'
import { EmptyState } from '../../components/ui/States'

const EMPTY_FORM = {
  title: '', mode: 'squad', map: 'Erangel', entry_fee: 0, prize_pool: 0,
  total_slots: 16, start_date: '', registration_deadline: '', rules: '', status: 'upcoming',
}

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    tournamentService.list().then((res) => setTournaments(res.data.tournaments)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (t) => {
    setEditing(t)
    setForm({
      title: t.title, mode: t.mode, map: t.map, entry_fee: t.entry_fee, prize_pool: t.prize_pool,
      total_slots: t.total_slots, start_date: t.start_date?.slice(0, 16), registration_deadline: t.registration_deadline?.slice(0, 16),
      rules: t.rules || '', status: t.status,
    })
    setModalOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.start_date || !form.registration_deadline) {
      toast.error('Please fill in title, start date, and registration deadline')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await tournamentService.update(editing.id, form)
        toast.success('Tournament updated')
      } else {
        await tournamentService.create(form)
        toast.success('Tournament created')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save tournament')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (t) => {
    if (!confirm(`Delete "${t.title}"? This cannot be undone.`)) return
    try {
      await tournamentService.remove(t.id)
      toast.success('Tournament deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete tournament')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-400">{tournaments.length} tournament(s)</p>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New Tournament
        </button>
      </div>

      {loading && <GridSkeleton count={4} />}
      {!loading && tournaments.length === 0 && (
        <EmptyState icon={Trophy} title="No tournaments yet" description="Create your first tournament to get started." action={<button onClick={openCreate} className="btn-primary">Create Tournament</button>} />
      )}

      {!loading && tournaments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tournaments.map((t) => (
            <div key={t.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={t.status} />
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-neon-green/40">
                    <Edit2 className="h-3.5 w-3.5 text-slate-300" />
                  </button>
                  <button onClick={() => remove(t)} className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-rose-500/40">
                    <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                  </button>
                </div>
              </div>
              <h3 className="font-display font-semibold text-white">{t.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{t.map} · {t.mode.toUpperCase()}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                <Calendar className="h-3.5 w-3.5" /> {new Date(t.start_date).toLocaleDateString()}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-sm">
                <span className="text-neon-green font-semibold">₹{Number(t.prize_pool).toLocaleString('en-IN')}</span>
                <span className="text-slate-500">{t.slots_filled}/{t.total_slots} slots</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Tournament' : 'Create Tournament'} maxWidth="max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-text">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="BGMI Winter Championship 2026" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Mode</label>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="input-field">
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>
            </div>
            <div>
              <label className="label-text">Map</label>
              <select value={form.map} onChange={(e) => setForm({ ...form, map: e.target.value })} className="input-field">
                {['Erangel', 'Miramar', 'Sanhok', 'Vikendi'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-text">Entry Fee (₹)</label>
              <input type="number" value={form.entry_fee} onChange={(e) => setForm({ ...form, entry_fee: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label-text">Prize Pool (₹)</label>
              <input type="number" value={form.prize_pool} onChange={(e) => setForm({ ...form, prize_pool: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label-text">Total Slots</label>
              <input type="number" value={form.total_slots} onChange={(e) => setForm({ ...form, total_slots: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Start Date & Time</label>
              <input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label-text">Registration Deadline</label>
              <input type="datetime-local" value={form.registration_deadline} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label-text">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
              <option value="upcoming">Upcoming</option>
              <option value="registration_open">Registration Open</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="label-text">Rules</label>
            <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={4} className="input-field resize-none" placeholder="Tournament rules and format..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Tournament'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
