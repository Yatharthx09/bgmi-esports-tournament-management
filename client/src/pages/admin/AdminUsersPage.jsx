import { useEffect, useState } from 'react'
import { Search, UserCog, ShieldOff, ShieldCheck } from 'lucide-react'
import { userService } from '../../services/tournamentService'
import { toast } from '../../context/ToastContext'
import TeamLogo from '../../components/ui/TeamLogo'
import { RowSkeleton } from '../../components/ui/Skeletons'
import { EmptyState } from '../../components/ui/States'

const ROLE_STYLES = {
  admin: 'bg-neon-purple/15 text-neon-purple border border-neon-purple/30',
  captain: 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30',
  viewer: 'bg-white/10 text-slate-300 border border-white/10',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')

  const load = () => {
    setLoading(true)
    userService.list({ search: search || undefined, role: role || undefined }).then((res) => setUsers(res.data.users)).finally(() => setLoading(false))
  }

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role])

  const toggleStatus = async (u) => {
    try {
      await userService.toggleStatus(u.id, !u.is_active)
      toast.success(`${u.name} ${!u.is_active ? 'activated' : 'deactivated'}`)
      load()
    } catch {
      toast.error('Could not update user status')
    }
  }

  const updateRole = async (u, newRole) => {
    try {
      await userService.updateRole(u.id, newRole)
      toast.success(`Role updated to ${newRole}`)
      load()
    } catch {
      toast.error('Could not update role')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-10" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field !w-auto">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="captain">Captain</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {loading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}</div>}
      {!loading && users.length === 0 && <EmptyState icon={UserCog} title="No users found" />}

      {!loading && users.length > 0 && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 text-xs uppercase">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Email</th>
                <th className="text-center p-4">Role</th>
                <th className="text-center p-4">Status</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="p-4 flex items-center gap-3">
                    <TeamLogo team={{ name: u.name, logo_gradient: 'from-neon-purple to-neon-blue' }} size="sm" />
                    <span className="text-slate-100">{u.name}</span>
                  </td>
                  <td className="p-4 text-slate-400">{u.email}</td>
                  <td className="p-4 text-center">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u, e.target.value)}
                      className={`badge ${ROLE_STYLES[u.role]} bg-transparent cursor-pointer`}
                    >
                      <option value="admin">Admin</option>
                      <option value="captain">Captain</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`badge ${u.is_active ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleStatus(u)} className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mx-auto hover:border-neon-green/40">
                      {u.is_active ? <ShieldOff className="h-3.5 w-3.5 text-rose-400" /> : <ShieldCheck className="h-3.5 w-3.5 text-neon-green" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
