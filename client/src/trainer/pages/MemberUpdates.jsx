import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const typeStyles = {
  info: 'border-white/10',
  success: 'border-accent-yellow/40',
  warning: 'border-accent-red/40',
  error: 'border-accent-red/40',
}

const MemberUpdates = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const { showToast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load updates', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleMarkRead = async (id) => {
    setBusyId(id)
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id) => {
    setBusyId(id)
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Member Updates</h2>
        <p className="mt-1 text-sm text-gray-400">Progress submissions, class bookings and schedule changes from your members.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState title="No updates" message="You're all caught up." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start justify-between gap-4 rounded-2xl border bg-surface/60 p-5 ${typeStyles[n.type]} ${
                !n.read ? 'ring-1 ring-accent-red/30' : ''
              }`}
            >
              <div>
                <p className="font-semibold text-white">{n.title}</p>
                <p className="mt-1 text-sm text-gray-400">{n.message}</p>
                <p className="mt-2 text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!n.read && (
                  <button
                    type="button"
                    disabled={busyId === n._id}
                    onClick={() => handleMarkRead(n._id)}
                    className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:text-white disabled:opacity-50"
                  >
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === n._id}
                  onClick={() => handleDelete(n._id)}
                  className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:text-accent-red disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MemberUpdates
