import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import StatCard from '../../admin/components/StatCard.jsx'
import Chart from '../../admin/components/Chart.jsx'
import Loader from '../../components/Loader.jsx'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const [membersRes, workoutRes, dietRes, progressRes] = await Promise.all([
          api.get('/trainer/members', { params: { limit: 1 } }),
          api.get('/trainer/workout-plans'),
          api.get('/trainer/diet-plans'),
          api.get('/trainer/progress', { params: { status: 'pending' } }),
        ])
        setStats({
          totalMembers: membersRes.data.total,
          totalWorkoutPlans: workoutRes.data.length,
          totalDietPlans: dietRes.data.length,
          pendingProgress: progressRes.data.length,
        })
        setPending(progressRes.data.slice(0, 5))
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load dashboard', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loader />

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <p className="mt-1 text-sm text-gray-400">Your coaching activity at a glance.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Members" value={stats?.totalMembers ?? 0} />
        <StatCard label="Workout Plans" value={stats?.totalWorkoutPlans ?? 0} accent="yellow" />
        <StatCard label="Diet Plans" value={stats?.totalDietPlans ?? 0} />
        <StatCard label="Pending Approvals" value={stats?.pendingProgress ?? 0} accent="yellow" />
      </div>

      <Chart title="Member Check-ins" />

      <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
        <h3 className="text-sm font-semibold text-white">Pending Progress Approvals</h3>
        <ul className="mt-4 space-y-3">
          {pending.length === 0 && <p className="text-sm text-gray-500">Nothing waiting for review.</p>}
          {pending.map((item) => (
            <li key={item._id} className="flex items-center justify-between border-b border-white/5 pb-3 text-sm last:border-none">
              <span className="text-gray-300">
                <span className="font-medium text-white">{item.member?.name}</span> submitted a progress update
              </span>
              <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
