import { motion } from 'framer-motion'

const DEFAULT_DATA = [40, 65, 50, 80, 60, 90, 75]

const Chart = ({ title = 'Monthly Signups', data = DEFAULT_DATA, subtitle = 'Placeholder data' }) => {
  const max = Math.max(...data, 1)

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      <div className="mt-6 flex h-40 items-end gap-3">
        {data.map((value, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(value / max) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="flex-1 rounded-t-md bg-gradient-to-t from-accent-red to-accent-yellow/70"
          />
        ))}
      </div>
    </div>
  )
}

export default Chart
