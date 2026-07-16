import { useEffect, useState } from 'react'
import { Shield, Plus, Trash2, Save } from 'lucide-react'
import { teamService } from '../../services/teamService'
import { toast } from '../../context/ToastContext'
import TeamLogo from '../../components/ui/TeamLogo'

const EMPTY_PLAYER = () => ({ name: '', bgmi_id: '', ign: '', is_substitute: false })

export default function CaptainMyTeamPage() {
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', tag: '', bio: '', players: [EMPTY_PLAYER(), EMPTY_PLAYER(), EMPTY_PLAYER(), EMPTY_PLAYER()] })
  const [newPlayer, setNewPlayer] = useState(EMPTY_PLAYER())
  const [addingPlayer, setAddingPlayer] = useState(false)

  const load = () => {
    setLoading(true)
    teamService.myTeam().then((res) => setTeam(res.data.team)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const updatePlayerField = (idx, field, value) => {
    setForm((f) => {
      const players = [...f.players]
      players[idx] = { ...players[idx], [field]: value }
      return { ...f, players }
    })
  }

  const addPlayerSlot = () => {
    if (form.players.length >= 5) return
    setForm((f) => ({ ...f, players: [...f.players, EMPTY_PLAYER()] }))
  }

  const removePlayerSlot = (idx) => {
    setForm((f) => ({ ...f, players: f.players.filter((_, i) => i !== idx) }))
  }

  const submitCreate = async (e) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Team name is required')
      return
    }
    const invalidPlayer = form.players.find((p) => !p.name || !p.bgmi_id || !p.ign)
    if (invalidPlayer) {
      toast.error('Every player needs a name, BGMI ID, and in-game name')
      return
    }
    setCreating(true)
    try {
      await teamService.create(form)
      toast.success('Team registered successfully!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not register team')
    } finally {
      setCreating(false)
    }
  }

  const addPlayerToExisting = async (e) => {
    e.preventDefault()
    if (!newPlayer.name || !newPlayer.bgmi_id || !newPlayer.ign) {
      toast.error('Please fill in all player fields')
      return
    }
    setAddingPlayer(true)
    try {
      await teamService.addPlayer({ team_id: team.id, ...newPlayer })
      toast.success('Player added')
      setNewPlayer(EMPTY_PLAYER())
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add player')
    } finally {
      setAddingPlayer(false)
    }
  }

  const removePlayer = async (playerId) => {
    if (!confirm('Remove this player from the roster?')) return
    try {
      await teamService.removePlayer(playerId)
      toast.success('Player removed')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove player')
    }
  }

  if (loading) return <div className="skeleton h-96 w-full" />

  if (!team) {
    return (
      <div className="max-w-3xl">
        <div className="glass-card p-6 mb-6 flex items-center gap-3">
          <Shield className="h-5 w-5 text-neon-green" />
          <div>
            <h3 className="font-display font-semibold text-white">Register Your Team</h3>
            <p className="text-sm text-slate-400">Add 1–4 main players and up to 1 substitute.</p>
          </div>
        </div>

        <form onSubmit={submitCreate} className="glass-card p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Team Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Team Soul" />
            </div>
            <div>
              <label className="label-text">Team Tag</label>
              <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} className="input-field" placeholder="SOUL" maxLength={5} />
            </div>
          </div>
          <div>
            <label className="label-text">Team Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} className="input-field resize-none" placeholder="Tell us about your squad" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label-text !mb-0">Roster ({form.players.length}/5)</label>
              {form.players.length < 5 && (
                <button type="button" onClick={addPlayerSlot} className="text-xs text-neon-green flex items-center gap-1 hover:underline">
                  <Plus className="h-3 w-3" /> Add slot
                </button>
              )}
            </div>
            <div className="space-y-3">
              {form.players.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input value={p.name} onChange={(e) => updatePlayerField(idx, 'name', e.target.value)} className="input-field" placeholder="Player name" />
                  <input value={p.bgmi_id} onChange={(e) => updatePlayerField(idx, 'bgmi_id', e.target.value)} className="input-field" placeholder="BGMI ID" />
                  <input value={p.ign} onChange={(e) => updatePlayerField(idx, 'ign', e.target.value)} className="input-field" placeholder="IGN" />
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap">
                    <input type="checkbox" checked={p.is_substitute} onChange={(e) => updatePlayerField(idx, 'is_substitute', e.target.checked)} className="accent-neon-green" /> Sub
                  </label>
                  {form.players.length > 1 && (
                    <button type="button" onClick={() => removePlayerSlot(idx)} className="text-rose-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={creating} className="btn-primary w-full">
            {creating ? 'Registering...' : 'Register Team'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center gap-4">
        <TeamLogo team={team} size="lg" />
        <div>
          <h2 className="text-xl font-display font-bold text-white">{team.name}</h2>
          <p className="text-sm text-slate-400 mt-1">{team.bio || 'No bio set yet.'}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-white mb-4">Roster ({team.players.length}/5)</h3>
        <div className="space-y-2 mb-6">
          {team.players.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div>
                <p className="text-sm font-medium text-slate-100">{p.ign} <span className="text-slate-500">({p.name})</span></p>
                <p className="text-xs text-slate-500 font-mono">{p.bgmi_id}</p>
              </div>
              <div className="flex items-center gap-3">
                {p.is_substitute && <span className="badge bg-amber-500/15 text-amber-300 border border-amber-500/30">Sub</span>}
                <button onClick={() => removePlayer(p.id)} className="text-rose-400 hover:text-rose-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {team.players.length < 5 && (
          <form onSubmit={addPlayerToExisting} className="border-t border-white/10 pt-4 flex gap-2 items-center flex-wrap">
            <input value={newPlayer.name} onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })} className="input-field flex-1 min-w-[120px]" placeholder="Player name" />
            <input value={newPlayer.bgmi_id} onChange={(e) => setNewPlayer({ ...newPlayer, bgmi_id: e.target.value })} className="input-field flex-1 min-w-[120px]" placeholder="BGMI ID" />
            <input value={newPlayer.ign} onChange={(e) => setNewPlayer({ ...newPlayer, ign: e.target.value })} className="input-field flex-1 min-w-[120px]" placeholder="IGN" />
            <label className="flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap">
              <input type="checkbox" checked={newPlayer.is_substitute} onChange={(e) => setNewPlayer({ ...newPlayer, is_substitute: e.target.checked })} className="accent-neon-green" /> Sub
            </label>
            <button type="submit" disabled={addingPlayer} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
