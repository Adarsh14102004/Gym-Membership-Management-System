import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import ClassCard from '../../components/ClassCard.jsx'
import Modal from '../../admin/components/Modal.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const CATEGORIES = ['Yoga', 'Cardio', 'Strength', 'Zumba', 'HIIT', 'Pilates']

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent-red'

const MyClasses = () => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')

  const [membersView, setMembersView] = useState(null)
  const [membersLoading, setMembersLoading] = useState(false)

  const { showToast } = useToast()

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/classes/my', { params: { search, category, date } })
      setClasses(data)
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
  }, [search, category, date])

  const openMembers = async (cls) => {
    setMembersLoading(true)
    setMembersView({ class: cls, members: [] })
    try {
      const { data } = await api.get(`/classes/${cls._id}/members`)
      setMembersView(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load class members', 'error')
      setMembersView(null)
    } finally {
      setMembersLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">My Classes</h2>
        <p className="mt-1 text-sm text-gray-400">Classes you're scheduled to lead.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search classes..."
          className={inputClass}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
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
        <EmptyState title="No classes assigned yet" message="Classes assigned to you by the admin will appear here." />
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <ClassCard
              key={cls._id}
              cls={cls}
              footer={
                <button
                  type="button"
                  onClick={() => openMembers(cls)}
                  className="w-full rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  View Members ({cls.bookedSeats})
                </button>
              }
            />
          ))}
        </motion.div>
      )}

      <Modal open={!!membersView} onClose={() => setMembersView(null)} title={membersView?.class?.title || 'Class Members'}>
        {membersLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : membersView?.members?.length ? (
          <ul className="space-y-2">
            {membersView.members.map((m) => (
              <li key={m._id} className="rounded-xl border border-white/10 bg-base px-4 py-3">
                <p className="text-sm font-semibold text-white">{m.name}</p>
                <p className="text-xs text-gray-400">{m.email}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-gray-500">No members have booked this class yet</p>
        )}
      </Modal>
    </div>
  )
}

export default MyClasses
