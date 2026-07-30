import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import StatCard from '../components/StatCard.jsx'
import Chart from '../components/Chart.jsx'
import Loader from '../../components/Loader.jsx'

const DashboardHome = () => {
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([api.get('/admin/stats'), api.get('/admin/activity')])
        setStats(statsRes.data)
        setActivity(activityRes.data)
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
        <p className="mt-1 text-sm text-gray-400">Snapshot of your gym&apos;s current activity.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={stats?.totalMembers ?? 0} />
        <StatCard label="Active Members" value={stats?.activeMembers ?? 0} accent="yellow" />
        <StatCard label="Total Trainers" value={stats?.totalTrainers ?? 0} />
        <StatCard label="Membership Plans" value={stats?.totalPlans ?? 0} accent="yellow" />
      </div>

      <Chart />

      <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
        <ul className="mt-4 space-y-3">
          {activity.length === 0 && <p className="text-sm text-gray-500">No recent activity.</p>}
          {activity.map((item) => (
            <li key={item._id} className="flex items-center justify-between border-b border-white/5 pb-3 text-sm last:border-none">
              <span className="text-gray-300">
                <span className="font-medium text-white">{item.name}</span> joined as {item.role}
              </span>
              <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default DashboardHome
