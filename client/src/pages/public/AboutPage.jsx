import { Target, Code2, GraduationCap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <span className="section-eyebrow">About the project</span>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-6">Built for competitive BGMI, by design.</h1>
      <p className="text-slate-400 leading-relaxed mb-6">
        BGMI Tournament Management System is a full-stack platform for running squad-based esports tournaments —
        from open registration through room reveal to the final leaderboard. It was built as a BTech final-year
        engineering project, with production-style architecture: a Flask REST API, a React dashboard, and role-based
        access for admins, team captains, and spectators.
      </p>

      <div className="grid sm:grid-cols-3 gap-5 my-10">
        {[
          { icon: Target, title: 'Purpose', desc: 'Give tournament organizers one place to manage teams, rooms, and scoring instead of spreadsheets and Discord threads.' },
          { icon: Code2, title: 'Stack', desc: 'React + Vite + Tailwind on the frontend, Flask + SQLAlchemy + JWT on the backend.' },
          { icon: GraduationCap, title: 'Origin', desc: 'Designed and built as a capstone project to demonstrate full-stack engineering and product thinking.' },
        ].map((f) => (
          <div key={f.title} className="glass-card p-5">
            <f.icon className="h-5 w-5 text-neon-green mb-3" />
            <h3 className="font-display font-semibold text-white mb-1.5">{f.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-slate-500 text-sm">
        This project is an independent, fan-built tool and is not affiliated with or endorsed by KRAFTON or the
        Battlegrounds Mobile India franchise.
      </p>
    </div>
  )
}
