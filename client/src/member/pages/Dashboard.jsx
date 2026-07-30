import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import Chart from '../../admin/components/Chart.jsx'

const GlassCard = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className={`rounded-2xl border border-white/10 bg-surface/60 p-6 backdrop-blur-sm transition-colors hover:border-white/20 ${className}`}
  >
    {children}
  </motion.div>
)

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const { showToast } = useToast()

  const load = async () => {
    try {
      const [summaryRes, progressRes] = await Promise.all([
        api.get('/member/dashboard'),
        api.get('/progress/mine'),
      ])
      setSummary(summaryRes.data)
      setProgress(progressRes.data.slice(-8))
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      await api.post('/member/attendance/checkin')
      showToast('Checked in for today!', 'success')
      load()
    } catch (error) {
      showToast(error.response?.data?.message || 'Check-in failed', 'error')
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const { membership } = summary

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">My Dashboard</h2>
        <p className="mt-1 text-sm text-gray-400">Your fitness journey at a glance.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard>
          <p className="text-sm text-gray-400">Membership Status</p>
          <p
            className={`mt-2 text-2xl font-extrabold ${
              membership.status === 'active' ? 'text-accent-yellow' : 'text-accent-red'
            }`}
          >
            {membership.planName || 'No Plan'}
          </p>
          <p className="mt-1 text-xs capitalize text-gray-500">{membership.status}</p>
        </GlassCard>

        <GlassCard>
          <p className="text-sm text-gray-400">Membership Expiry</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {membership.daysRemaining != null ? `${membership.daysRemaining}d` : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString() : 'No active plan'}
          </p>
        </GlassCard>

        <GlassCard>
          <p className="text-sm text-gray-400">Today&apos;s Attendance</p>
          {summary.attendanceToday ? (
            <p className="mt-2 text-2xl font-extrabold text-accent-yellow">Checked In</p>
          ) : (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="mt-2 rounded-full bg-accent-red px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
            >
              {checkingIn ? 'Checking in...' : 'Check In Now'}
            </button>
          )}
        </GlassCard>

        <GlassCard>
          <p className="text-sm text-gray-400">Today&apos;s Workout</p>
          {summary.todayWorkout ? (
            <>
              <p className="mt-2 text-lg font-bold text-white">{summary.todayWorkout.title}</p>
              <p className="mt-1 text-xs text-gray-500">{summary.todayWorkout.exercises?.length || 0} exercises</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-500">No active plan assigned</p>
          )}
          <Link to="/member/workout-plan" className="mt-3 inline-block text-xs font-semibold text-accent-yellow hover:underline">
            View details
          </Link>
        </GlassCard>

        <GlassCard>
          <p className="text-sm text-gray-400">Today&apos;s Diet</p>
          {summary.todayDiet ? (
            <>
              <p className="mt-2 text-lg font-bold text-white">{summary.todayDiet.title}</p>
              <p className="mt-1 text-xs text-gray-500">{summary.todayDiet.meals?.length || 0} meals</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-500">No active plan assigned</p>
          )}
          <Link to="/member/diet-plan" className="mt-3 inline-block text-xs font-semibold text-accent-yellow hover:underline">
            View details
          </Link>
        </GlassCard>

        <GlassCard>
          <p className="text-sm text-gray-400">Notifications</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{summary.unreadNotifications}</p>
          <Link to="/member/notifications" className="mt-3 inline-block text-xs font-semibold text-accent-yellow hover:underline">
            View all
          </Link>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          title="Weight Progress (kg)"
          subtitle="Based on your submitted entries"
          data={progress.length ? progress.map((p) => p.weight || 0) : [0]}
        />
        <Chart
          title="BMI Progress"
          subtitle="Based on your submitted entries"
          data={progress.length ? progress.map((p) => p.bmi || 0) : [0]}
        />
      </div>
    </div>
  )
}

export default Dashboard
