import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const roleLabel = {
  admin: 'Administrator',
  trainer: 'Trainer',
  member: 'Member',
}

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    showToast('Logged out successfully', 'info')
    navigate('/login')
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl border border-white/10 bg-surface/60 p-10 backdrop-blur-sm"
      >
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent-yellow">
          {roleLabel[user?.role] || 'Member'} Dashboard
        </span>
        <h1 className="mt-6 text-3xl font-bold text-white">Welcome, {user?.name}</h1>
        <p className="mt-2 text-gray-400">{user?.email}</p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 rounded-full bg-accent-red px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
        >
          Logout
        </button>
      </motion.div>
    </div>
  )
}

export default Dashboard
