import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, accent = 'green', trend }) {
  const accents = {
    green: 'text-neon-green bg-neon-green/10 border-neon-green/25',
    purple: 'text-neon-purple bg-neon-purple/10 border-neon-purple/25',
    blue: 'text-neon-blue bg-neon-blue/10 border-neon-blue/25',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover p-5 flex items-center justify-between"
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400 font-display font-semibold">{label}</p>
        <p className="text-2xl font-display font-bold text-white mt-1.5">{value}</p>
        {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
      </div>
      <div className={`h-11 w-11 rounded-xl border flex items-center justify-center ${accents[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </motion.div>
  )
}
