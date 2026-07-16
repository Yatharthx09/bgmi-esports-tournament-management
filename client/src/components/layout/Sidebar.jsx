import { NavLink } from 'react-router-dom'
import { Trophy } from 'lucide-react'

export default function Sidebar({ links, roleLabel }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/10 bg-ink-900/60 backdrop-blur-xl h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
          <Trophy className="h-5 w-5 text-ink-950" />
        </div>
        <div>
          <p className="font-display font-bold text-white text-sm leading-tight">
            BGMI<span className="text-neon-green">TMS</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/25 shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <link.icon className="h-[18px] w-[18px]" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
