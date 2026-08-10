import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

// Loads the Razorpay Checkout script once and caches the in-flight promise so
// repeated calls (e.g. re-renders) don't inject the script twice.
let razorpayScriptPromise = null
const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true)
  if (razorpayScriptPromise) return razorpayScriptPromise

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_SRC
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
  return razorpayScriptPromise
}

const Payment = () => {
  const [plans, setPlans] = useState([])
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [gatewayConfigured, setGatewayConfigured] = useState(false)
  const [paying, setPaying] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, membershipRes, gatewayRes] = await Promise.all([
          api.get('/member/plans'),
          api.get('/member/membership'),
          api.get('/payment/gateway-status'),
        ])
        setPlans(plansRes.data)
        setMembership(membershipRes.data)
        setGatewayConfigured(Boolean(gatewayRes.data?.razorpayConfigured))
        const current = plansRes.data.find((p) => p.name === membershipRes.data.planName)
        setSelectedPlan(current?._id || plansRes.data[0]?._id || null)
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load plans', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleRazorpayPay = async () => {
    setPaying(true)
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        showToast('Could not load the payment gateway. Check your connection and try again.', 'error')
        return
      }

      const { data: order } = await api.post('/payment/razorpay/order', { plan: selectedPlan })

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'FITZONE Gym',
        description: `${order.plan.name} membership`,
        theme: { color: '#ff3b30' },
        handler: async (response) => {
          try {
            const { data } = await api.post('/payment/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan,
            })
            showToast('Payment successful!', 'success')
            navigate('/member/payment/success', { state: data })
          } catch (error) {
            showToast(error.response?.data?.message || 'Payment verification failed', 'error')
          } finally {
            setPaying(false)
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      })

      razorpay.on('payment.failed', () => {
        showToast('Payment failed. Please try again.', 'error')
        setPaying(false)
      })

      razorpay.open()
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not start checkout', 'error')
      setPaying(false)
    }
  }

  const handleDemoPay = async () => {
    setPaying(true)
    try {
      const { data } = await api.post('/payment/demo', { plan: selectedPlan })
      showToast('Demo payment successful!', 'success')
      navigate('/member/payment/success', { state: data })
    } catch (error) {
      showToast(error.response?.data?.message || 'Payment failed', 'error')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  const selectedPlanDoc = plans.find((p) => p._id === selectedPlan)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">
          {membership?.status === 'active' ? 'Renew Membership' : 'Choose a Membership Plan'}
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          {gatewayConfigured
            ? 'Secure checkout powered by Razorpay.'
            : 'Payment gateway not yet configured — using demo checkout (no real charge is made).'}
        </p>
      </div>

      {plans.length === 0 ? (
        <EmptyState title="No plans available" message="Contact the gym front desk for membership options." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <motion.button
                key={plan._id}
                type="button"
                whileHover={{ y: -4 }}
                onClick={() => setSelectedPlan(plan._id)}
                className={`rounded-2xl border p-6 text-left transition-colors ${
                  selectedPlan === plan._id ? 'border-accent-red bg-accent-red/10' : 'border-white/10 bg-surface/60 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <span className="rounded-full bg-accent-yellow/15 px-3 py-1 text-xs font-semibold text-accent-yellow">Popular</span>
                )}
                <h3 className="mt-3 text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-2xl font-extrabold text-white">
                  ₹{plan.price} <span className="text-sm font-normal capitalize text-gray-400">/ {plan.duration}</span>
                </p>
                <ul className="mt-3 space-y-1 text-xs text-gray-400">
                  {plan.features?.slice(0, 3).map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg space-y-4 rounded-2xl border border-white/10 bg-surface/60 p-6"
          >
            <h3 className="text-sm font-semibold text-white">Checkout</h3>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-base px-4 py-3 text-sm">
              <span className="text-gray-400">Plan</span>
              <span className="font-semibold text-white">{selectedPlanDoc?.name || '—'}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-base px-4 py-3 text-sm">
              <span className="text-gray-400">Amount</span>
              <span className="font-semibold text-white">₹{selectedPlanDoc?.price ?? '—'}</span>
            </div>

            <button
              type="button"
              onClick={gatewayConfigured ? handleRazorpayPay : handleDemoPay}
              disabled={paying || !selectedPlan}
              className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {paying ? 'Processing payment...' : `Pay ₹${selectedPlanDoc?.price ?? ''}`}
            </button>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Payment
