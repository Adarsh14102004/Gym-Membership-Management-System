import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Loader from '../../components/Loader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import StatCard from '../components/StatCard.jsx'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.06)' } },
    y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.06)' } },
  },
}

const pieOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } },
}

const PIE_COLORS = ['#ff3b30', '#ffd60a', '#60a5fa', '#34d399', '#a78bfa', '#f472b6']

const monthLabel = (key) => {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: 'short' })
}

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/10 bg-surface/60 p-6 backdrop-blur-sm ${className}`}>{children}</div>
)

const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/analytics/overview')
        setData(data)
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load analytics', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <Loader />
  if (!data) return <EmptyState title="No analytics available" />

  const { membership, revenue, classes, attendance } = data

  const revenueChartData = {
    labels: revenue.monthlyRevenue.map((m) => monthLabel(m.month)),
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenue.monthlyRevenue.map((m) => m.total),
        borderColor: '#ff3b30',
        backgroundColor: 'rgba(255,59,48,0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const growthChartData = {
    labels: membership.membershipGrowth.map((m) => monthLabel(m.month)),
    datasets: [
      {
        label: 'New Members',
        data: membership.membershipGrowth.map((m) => m.count),
        borderColor: '#ffd60a',
        backgroundColor: 'rgba(255,214,10,0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const attendanceChartData = {
    labels: attendance.dailyAttendance.map((d) => new Date(d.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })),
    datasets: [{ label: 'Check-ins', data: attendance.dailyAttendance.map((d) => d.count), backgroundColor: '#ff3b30' }],
  }

  const peakHoursChartData = {
    labels: attendance.peakGymHours.map((h) => `${h.hour}:00`),
    datasets: [{ label: 'Check-ins', data: attendance.peakGymHours.map((h) => h.count), backgroundColor: '#ffd60a' }],
  }

  const popularClassesChartData = {
    labels: classes.popularClasses.map((c) => c.title),
    datasets: [
      {
        data: classes.popularClasses.map((c) => c.bookedSeats),
        backgroundColor: classes.popularClasses.map((_, i) => PIE_COLORS[i % PIE_COLORS.length]),
        borderWidth: 0,
      },
    ],
  }

  const trainerPerfChartData = {
    labels: classes.trainerPerformance.map((t) => t.trainer),
    datasets: [{ label: 'Bookings', data: classes.trainerPerformance.map((t) => t.totalBookings), backgroundColor: '#60a5fa' }],
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <p className="mt-1 text-sm text-gray-400">Membership, revenue, class and attendance insights.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={membership.totalMembers} />
        <StatCard label="Active Memberships" value={membership.activeMembers} accent="yellow" />
        <StatCard label="Total Revenue" value={`$${revenue.totalRevenue.toLocaleString()}`} />
        <StatCard label="Today's Attendance" value={`${attendance.attendancePercentage}%`} accent="yellow" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-white">Revenue Trend (6 months)</h3>
          {revenue.monthlyRevenue.some((m) => m.total > 0) ? (
            <Line data={revenueChartData} options={chartOptions} />
          ) : (
            <EmptyState title="No revenue data yet" />
          )}
        </Card>
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-white">Member Growth (6 months)</h3>
          {membership.membershipGrowth.some((m) => m.count > 0) ? (
            <Line data={growthChartData} options={chartOptions} />
          ) : (
            <EmptyState title="No new members yet" />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-white">Attendance (last 14 days)</h3>
          {attendance.dailyAttendance.length ? (
            <Bar data={attendanceChartData} options={chartOptions} />
          ) : (
            <EmptyState title="No attendance recorded yet" />
          )}
        </Card>
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-white">Peak Gym Hours (last 30 days)</h3>
          {attendance.peakGymHours.some((h) => h.count > 0) ? (
            <Bar data={peakHoursChartData} options={chartOptions} />
          ) : (
            <EmptyState title="No check-in data yet" />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-white">Most Popular Classes</h3>
          {classes.popularClasses.length ? (
            <Pie data={popularClassesChartData} options={pieOptions} />
          ) : (
            <EmptyState title="No classes yet" />
          )}
        </Card>
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-white">Trainer Performance (bookings)</h3>
          {classes.trainerPerformance.length ? (
            <Bar data={trainerPerfChartData} options={chartOptions} />
          ) : (
            <EmptyState title="No trainer activity yet" />
          )}
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-surface/60 p-6">
          <p className="text-sm text-gray-400">Expired Memberships</p>
          <p className="mt-2 text-2xl font-extrabold text-accent-red">{membership.expiredMemberships}</p>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-surface/60 p-6">
          <p className="text-sm text-gray-400">New Registrations (this month)</p>
          <p className="mt-2 text-2xl font-extrabold text-accent-yellow">{membership.newRegistrations}</p>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-surface/60 p-6">
          <p className="text-sm text-gray-400">Total Class Bookings</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{classes.bookingCount}</p>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics
