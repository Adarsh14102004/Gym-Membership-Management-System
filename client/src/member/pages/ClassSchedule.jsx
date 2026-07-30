import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import ClassCard from '../../components/ClassCard.jsx'
import Modal from '../../admin/components/Modal.jsx'
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent-red'

const ClassSchedule = () => {
  const [classes, setClasses] = useState([])
  const [categories, setCategories] = useState([])
  const [trainerOptions, setTrainerOptions] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [trainer, setTrainer] = useState('')
  const [date, setDate] = useState('')

  const [selected, setSelected] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [booking, setBooking] = useState(false)

  const { showToast } = useToast()

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/classes', { params: { upcoming: true, search, category, trainer, date, limit: 100 } })
      setClasses(data.data)
      setCategories(data.categories)
      if (!trainer) {
        const unique = []
        const seen = new Set()
        data.data.forEach((c) => {
          if (c.trainer && !seen.has(c.trainer._id)) {
            seen.add(c.trainer._id)
            unique.push(c.trainer)
          }
        })
        setTrainerOptions(unique)
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load classes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchClasses, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, trainer, date])

  const handleBook = async () => {
    setBooking(true)
    try {
      await api.post('/bookings', { classId: selected._id })
      showToast('Class booked successfully!', 'success')
      setConfirmOpen(false)
      setSelected(null)
      fetchClasses()
    } catch (error) {
      showToast(error.response?.data?.message || 'Booking failed', 'error')
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Class Schedule</h2>
        <p className="mt-1 text-sm text-gray-400">Browse upcoming classes and reserve your spot.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search classes..."
          className={inputClass}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={trainer} onChange={(e) => setTrainer(e.target.value)} className={inputClass}>
          <option value="">All Trainers</option>
          {trainerOptions.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState title="No classes found" message="Try adjusting your filters or check back later." />
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <ClassCard
              key={cls._id}
              cls={cls}
              onClick={() => setSelected(cls)}
              footer={
                cls.booked ? (
                  <span className="rounded-full bg-accent-yellow/15 px-3 py-1.5 text-center text-xs font-semibold text-accent-yellow">
                    You're booked
                  </span>
                ) : null
              }
            />
          ))}
        </motion.div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300">
              {selected.category}
            </span>
            <p className="text-sm text-gray-400">{selected.description || 'No description provided.'}</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
              <p>
                <span className="text-gray-500">Trainer: </span>
                {selected.trainer?.name || 'TBA'}
              </p>
              <p>
                <span className="text-gray-500">Date: </span>
                {new Date(selected.date).toLocaleDateString()}
              </p>
              <p>
                <span className="text-gray-500">Time: </span>
                {selected.startTime} - {selected.endTime}
              </p>
              <p>
                <span className="text-gray-500">Seats: </span>
                {selected.seatsLeft <= 0 ? 'Full' : `${selected.seatsLeft} of ${selected.capacity} left`}
              </p>
            </div>

            {selected.booked ? (
              <p className="rounded-xl bg-accent-yellow/15 px-4 py-3 text-center text-sm font-semibold text-accent-yellow">
                You're already booked for this class
              </p>
            ) : selected.seatsLeft <= 0 ? (
              <button type="button" disabled className="w-full rounded-xl bg-white/10 py-3 text-sm font-semibold text-gray-400">
                Class Full
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                Book This Class
              </button>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Booking"
        message={`Reserve your spot in "${selected?.title}" on ${selected ? new Date(selected.date).toLocaleDateString() : ''}?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleBook}
        loading={booking}
        confirmLabel="Confirm Booking"
        loadingLabel="Booking..."
        tone="yellow"
      />
    </div>
  )
}

export default ClassSchedule
