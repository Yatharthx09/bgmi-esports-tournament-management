import { useState } from 'react'
import { Mail, MapPin, Send } from 'lucide-react'
import { toast } from '../../context/ToastContext'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields')
      return
    }
    setSending(true)
    setTimeout(() => {
      toast.success("Message sent — we'll get back to you soon.")
      setForm({ name: '', email: '', message: '' })
      setSending(false)
    }, 700)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <span className="section-eyebrow">Get in touch</span>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-8">Contact Us</h1>

      <div className="grid sm:grid-cols-2 gap-8">
        <form onSubmit={submit} className="glass-card p-6 space-y-4">
          <div>
            <label className="label-text">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Your name" />
          </div>
          <div>
            <label className="label-text">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label-text">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="input-field resize-none" placeholder="How can we help?" />
          </div>
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? 'Sending...' : <>Send Message <Send className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="space-y-4">
          <div className="glass-card p-6 flex items-start gap-4">
            <Mail className="h-5 w-5 text-neon-green mt-0.5" />
            <div>
              <p className="font-display font-semibold text-white">Email</p>
              <p className="text-sm text-slate-400 mt-1">support@bgmitms.com</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-start gap-4">
            <MapPin className="h-5 w-5 text-neon-green mt-0.5" />
            <div>
              <p className="font-display font-semibold text-white">Location</p>
              <p className="text-sm text-slate-400 mt-1">India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
