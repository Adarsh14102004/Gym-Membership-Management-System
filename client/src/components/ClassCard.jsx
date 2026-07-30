import { motion } from 'framer-motion'

const categoryColors = {
  Yoga: 'bg-accent-yellow/15 text-accent-yellow',
  Cardio: 'bg-accent-red/15 text-accent-red',
  Strength: 'bg-accent-red/15 text-accent-red',
  Zumba: 'bg-accent-yellow/15 text-accent-yellow',
  HIIT: 'bg-accent-red/15 text-accent-red',
  Pilates: 'bg-accent-yellow/15 text-accent-yellow',
}

const ClassCard = ({ cls, onClick, footer }) => {
  const dateObj = new Date(cls.date)
  const day = dateObj.toLocaleDateString('en-US', { day: '2-digit' })
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
  const full = cls.seatsLeft <= 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface/60 p-5 transition-colors hover:border-accent-red/40 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 flex-none flex-col items-center justify-center rounded-xl bg-base text-center">
            <span className="text-lg font-extrabold leading-none text-white">{day}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{month}</span>
          </div>
          <div>
            <h3 className="font-bold text-white">{cls.title}</h3>
            <p className="text-xs text-gray-400">{cls.trainer?.name || 'TBA'}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[cls.category] || 'bg-white/10 text-gray-300'}`}>
          {cls.category}
        </span>
      </div>

      <p className="text-sm text-gray-400">
        {cls.startTime} - {cls.endTime}
      </p>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-gray-400">
          <span>Seats</span>
          <span className={full ? 'font-semibold text-accent-red' : 'font-semibold text-accent-yellow'}>
            {full ? 'Full' : `${cls.seatsLeft} left`}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${full ? 'bg-accent-red' : 'bg-accent-yellow'}`}
            style={{ width: `${Math.min((cls.bookedSeats / cls.capacity) * 100, 100)}%` }}
          />
        </div>
      </div>

      {footer}
    </motion.div>
  )
}

export default ClassCard
