import { useState } from 'react'
import { Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { toast } from '../../context/ToastContext'

export default function AdminSettingsPage() {
  const { user, updateUserCache } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '' })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await authService.updateProfile(form)
      updateUserCache(res.data.user)
      toast.success('Profile updated')
      setForm((f) => ({ ...f, password: '' }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-white mb-4">Admin Profile</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-text">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-text">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="Optional" />
          </div>
          <div>
            <label className="label-text">New Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Leave blank to keep current password" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-white mb-3">Platform Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-slate-500">Version</p><p className="text-slate-200 mt-1">1.0.0</p></div>
          <div><p className="text-slate-500">Environment</p><p className="text-slate-200 mt-1">Development</p></div>
        </div>
      </div>
    </div>
  )
}
