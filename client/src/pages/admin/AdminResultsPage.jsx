import { useEffect, useState } from 'react'
import { Save, ClipboardList } from 'lucide-react'
import { tournamentService, matchService, resultService, leaderboardService } from '../../services/tournamentService'
import { toast } from '../../context/ToastContext'
import TeamLogo from '../../components/ui/TeamLogo'
import { EmptyState } from '../../components/ui/States'

export default function AdminResultsPage() {
  const [tournaments, setTournaments] = useState([])
  const [selectedTournament, setSelectedTournament] = useState('')
  const [matches, setMatches] = useState([])
  const [selectedMatch, setSelectedMatch] = useState('')
  const [teams, setTeams] = useState([])
  const [rows, setRows] = useState([])
  const [saving, setSaving] = useState(false)
  const [finalize, setFinalize] = useState(true)

  useEffect(() => {
    tournamentService.list().then((res) => {
      setTournaments(res.data.tournaments)
      if (res.data.tournaments.length) setSelectedTournament(String(res.data.tournaments[0].id))
    })
  }, [])

  useEffect(() => {
    if (!selectedTournament) return
    matchService.listByTournament(selectedTournament).then((res) => {
      setMatches(res.data.matches)
      if (res.data.matches.length) setSelectedMatch(String(res.data.matches[0].id))
      else setSelectedMatch('')
    })
    leaderboardService.get(selectedTournament).then((res) => {
      setTeams(res.data.leaderboard.map((e) => ({ id: e.team_id, name: e.team_name, logo_gradient: e.team_logo_gradient })))
    })
  }, [selectedTournament])

  useEffect(() => {
    if (!selectedMatch || teams.length === 0) return
    resultService.listByMatch(selectedMatch).then((res) => {
      const existing = res.data.results
      const merged = teams.map((t, idx) => {
        const found = existing.find((r) => r.team_id === t.id)
        return {
          team_id: t.id,
          team_name: t.name,
          logo_gradient: t.logo_gradient,
          placement: found ? found.placement : idx + 1,
          finishes: found ? found.finishes : 0,
        }
      })
      setRows(merged)
    })
  }, [selectedMatch, teams])

  const updateRow = (teamId, field, value) => {
    setRows((rs) => rs.map((r) => (r.team_id === teamId ? { ...r, [field]: value } : r)))
  }

  const submit = async () => {
    const placements = rows.map((r) => Number(r.placement))
    if (new Set(placements).size !== placements.length) {
      toast.error('Each team must have a unique placement')
      return
    }
    setSaving(true)
    try {
      await resultService.bulkAdd({
        match_id: Number(selectedMatch),
        results: rows.map((r) => ({ team_id: r.team_id, placement: Number(r.placement), finishes: Number(r.finishes) })),
        finalize,
      })
      toast.success('Results saved and leaderboard recalculated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save results')
    } finally {
      setSaving(false)
    }
  }

  const placementPoints = (p) => {
    const table = { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2 }
    if (table[p]) return table[p]
    if (p >= 8 && p <= 16) return 1
    return 0
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selectedTournament} onChange={(e) => setSelectedTournament(e.target.value)} className="input-field !w-auto">
          {tournaments.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)} className="input-field !w-auto">
          {matches.map((m) => <option key={m.id} value={m.id}>Match #{m.match_number} — {m.map}</option>)}
        </select>
      </div>

      {matches.length === 0 && (
        <EmptyState icon={ClipboardList} title="No matches to score" description="Create a match first from Match Room Management." />
      )}

      {matches.length > 0 && rows.length > 0 && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 text-xs uppercase">
                <th className="text-left p-4">Team</th>
                <th className="text-center p-4">Placement</th>
                <th className="text-center p-4">Finishes</th>
                <th className="text-center p-4">Placement Pts</th>
                <th className="text-center p-4">Finish Pts</th>
                <th className="text-center p-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.team_id} className="border-b border-white/5">
                  <td className="p-4 flex items-center gap-2">
                    <TeamLogo team={{ name: r.team_name, logo_gradient: r.logo_gradient }} size="sm" />
                    {r.team_name}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number" min={1} max={32} value={r.placement}
                      onChange={(e) => updateRow(r.team_id, 'placement', e.target.value)}
                      className="input-field !w-20 text-center mx-auto"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number" min={0} value={r.finishes}
                      onChange={(e) => updateRow(r.team_id, 'finishes', e.target.value)}
                      className="input-field !w-20 text-center mx-auto"
                    />
                  </td>
                  <td className="p-4 text-center text-slate-300">{placementPoints(Number(r.placement))}</td>
                  <td className="p-4 text-center text-slate-300">{r.finishes}</td>
                  <td className="p-4 text-center font-bold text-neon-green">{placementPoints(Number(r.placement)) + Number(r.finishes)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 flex items-center justify-between border-t border-white/10 flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={finalize} onChange={(e) => setFinalize(e.target.checked)} className="accent-neon-green" />
              Mark match as completed
            </label>
            <button onClick={submit} disabled={saving} className="btn-primary">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Results'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
