import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const DietPlan = () => {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/member/diet-plan')
        setPlan(data)
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load diet plan', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Diet Plan</h2>
        <p className="mt-1 text-sm text-gray-400">Your current nutrition plan from your coach.</p>
      </div>

      {loading ? (
        <Skeleton className="h-48" />
      ) : !plan ? (
        <EmptyState title="No active diet plan" message="Your trainer hasn't assigned a diet plan yet." />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-surface/60 p-8"
        >
          <span className="rounded-full bg-accent-yellow/15 px-3 py-1 text-xs font-semibold text-accent-yellow">Active</span>
          <h3 className="mt-4 text-2xl font-bold text-white">{plan.title}</h3>
          {plan.trainer?.name && <p className="mt-1 text-sm text-gray-400">Coach: {plan.trainer.name}</p>}

          <ul className="mt-6 space-y-2">
            {plan.meals?.map((meal, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-red" />
                {meal}
              </li>
            ))}
          </ul>

          {plan.notes && <p className="mt-6 text-sm text-gray-400">Notes: {plan.notes}</p>}
        </motion.div>
      )}
    </div>
  )
}

export default DietPlan
