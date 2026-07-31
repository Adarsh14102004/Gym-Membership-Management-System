import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const MyMembership = () => {
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/member/membership')
        setMembership(data)
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load membership', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">My Membership</h2>
        <p className="mt-1 text-sm text-gray-400">Your current plan and billing details.</p>
      </div>

      {loading ? (
        <Skeleton className="h-56" />
      ) : !membership.planName ? (
        <div className="space-y-4">
          <EmptyState title="No active membership plan" message="Choose a plan below to get started." />
          <Link
            to="/member/payment"
            className="inline-block rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
          >
            Choose a Plan
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl rounded-2xl border border-white/10 bg-surface/60 p-8"
        >
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              membership.status === 'active' ? 'bg-accent-yellow/15 text-accent-yellow' : 'bg-accent-red/15 text-accent-red'
            }`}
          >
            {membership.status}
          </span>
          <h3 className="mt-4 text-2xl font-extrabold text-white">{membership.planName}</h3>
          <p className="mt-1 text-gray-400">
            ${membership.price} <span className="capitalize">/ {membership.duration}</span>
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Start Date</p>
              <p className="mt-1 font-medium text-white">{new Date(membership.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Expiry Date</p>
              <p className="mt-1 font-medium text-white">{new Date(membership.expiryDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Days Remaining</p>
              <p className="mt-1 font-medium text-white">{membership.daysRemaining}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/member/payment"
              className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
            >
              Renew Membership
            </Link>
            <Link
              to="/member/payments"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white"
            >
              Payment History
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default MyMembership
