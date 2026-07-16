import { Link } from 'react-router-dom'
import { Trophy, Twitter, Youtube, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
              <Trophy className="h-4 w-4 text-ink-950" />
            </div>
            <span className="font-display font-bold text-white">
              BGMI<span className="text-neon-green">TMS</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-xs">
            The complete tournament operating system for competitive BGMI — from registration to the final chicken dinner.
          </p>
        </div>

        <div>
          <p className="section-eyebrow mb-3">Platform</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/tournaments" className="hover:text-neon-green transition-colors">Tournaments</Link></li>
            <li><Link to="/leaderboard" className="hover:text-neon-green transition-colors">Leaderboard</Link></li>
            <li><Link to="/register" className="hover:text-neon-green transition-colors">Register a Team</Link></li>
          </ul>
        </div>

        <div>
          <p className="section-eyebrow mb-3">Company</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/about" className="hover:text-neon-green transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-neon-green transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="section-eyebrow mb-3">Follow the action</p>
          <div className="flex gap-3">
            <a href="#" className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-neon-green/40 transition-colors">
              <Twitter className="h-4 w-4 text-slate-400" />
            </a>
            <a href="#" className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-neon-green/40 transition-colors">
              <Youtube className="h-4 w-4 text-slate-400" />
            </a>
            <a href="#" className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-neon-green/40 transition-colors">
              <Instagram className="h-4 w-4 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} BGMI Tournament Management System. Built as a BTech final-year project. Not affiliated with KRAFTON.
      </div>
    </footer>
  )
}
