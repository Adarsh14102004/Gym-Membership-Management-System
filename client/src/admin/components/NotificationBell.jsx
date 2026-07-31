import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

const typeDot = {
  info: 'bg-gray-400',
  success: 'bg-green-400',
  warning: 'bg-accent-yellow',
  error: 'bg-accent-red',
}

const VIEW_ALL_PATH = {
  member: '/member/notifications',
  trainer: '/trainer/updates',
}

const NotificationBell = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)

  const loadUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count')
      setUnreadCount(data.count)
    } catch {
      // silent - non-critical background poll
    }
  }

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.slice(0, 8))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (open) loadNotifications()
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // silent
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }

  const remove = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
    } catch {
      // silent
    }
  }

  const viewAllPath = VIEW_ALL_PATH[user?.role]

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-300 transition-colors hover:text-white"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-black/50"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-bold text-white">Notifications</p>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllRead} className="text-xs font-medium text-accent-yellow hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="px-4 py-6 text-center text-sm text-gray-500">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-500">You're all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-2 border-b border-white/5 px-4 py-3 text-sm last:border-none ${
                      !n.read ? 'bg-white/[0.03]' : ''
                    }`}
                  >
                    <span className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${typeDot[n.type] || 'bg-gray-400'}`} />
                    <div className="min-w-0 flex-1" onClick={() => !n.read && markRead(n._id)} role="presentation">
                      <p className="cursor-pointer truncate font-medium text-white">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">{n.message}</p>
                      <p className="mt-1 text-[10px] text-gray-600">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(n._id)}
                      className="flex-none text-gray-600 hover:text-accent-red"
                      aria-label="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {viewAllPath && (
              <Link
                to={viewAllPath}
                onClick={() => setOpen(false)}
                className="block border-t border-white/10 px-4 py-3 text-center text-xs font-semibold text-accent-yellow hover:underline"
              >
                View all
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
