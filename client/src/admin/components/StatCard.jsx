import { motion } from 'framer-motion'

const StatCard = ({ label, value, accent = 'red' }) => {
  const accentClass = accent === 'yellow' ? 'text-accent-yellow' : 'text-accent-red'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/10 bg-surface/60 p-6 backdrop-blur-sm transition-colors hover:border-white/20"
    >
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${accentClass}`}>{value}</p>
    </motion.div>
  )
}

export default StatCard
