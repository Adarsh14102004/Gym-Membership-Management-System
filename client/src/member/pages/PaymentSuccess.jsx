import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const PaymentSuccess = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!state?.payment) {
      navigate('/member/payments', { replace: true })
    }
  }, [state, navigate])

  if (!state?.payment) return null

  const { payment, membership } = state

  return (
    <div className="flex justify-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-surface/60 p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-yellow/15 text-3xl text-accent-yellow"
        >
          ✓
        </motion.div>
        <h2 className="mt-4 text-2xl font-bold text-white">Payment Successful</h2>
        <p className="mt-1 text-sm text-gray-400">Your membership has been activated.</p>

        <div className="mt-6 space-y-3 rounded-xl border border-white/5 bg-base p-4 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Plan</span>
            <span className="font-medium text-white">{payment.plan?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-medium text-white">${payment.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-medium text-white">{payment.transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Valid Until</span>
            <span className="font-medium text-white">{new Date(membership.endDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/member/membership"
            className="flex-1 rounded-xl bg-accent-red py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            View Membership
          </Link>
          <Link
            to="/member/payments"
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-gray-300 hover:text-white"
          >
            Payment History
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentSuccess
