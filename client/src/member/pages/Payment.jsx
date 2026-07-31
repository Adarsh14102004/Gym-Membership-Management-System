import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red'

const emptyCard = { cardName: '', cardNumber: '', expiry: '', cvv: '' }

const Payment = () => {
  const [plans, setPlans] = useState([])
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [card, setCard] = useState(emptyCard)
  const [paying, setPaying] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, membershipRes] = await Promise.all([api.get('/member/plans'), api.get('/member/membership')])
        setPlans(plansRes.data)
        setMembership(membershipRes.data)
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

  const handleCardChange = (e) => setCard((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePay = async (e) => {
    e.preventDefault()
    if (!selectedPlan) return
    if (!/^\d{16}$/.test(card.cardNumber.replace(/\s/g, ''))) {
      showToast('Enter a valid 16-digit card number', 'error')
      return
    }
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
      showToast('Enter expiry as MM/YY', 'error')
      return
    }
    if (!/^\d{3,4}$/.test(card.cvv)) {
      showToast('Enter a valid CVV', 'error')
      return
    }

    setPaying(true)
    try {
      const { data } = await api.post('/payment', { plan: selectedPlan })
      showToast('Payment successful!', 'success')
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">
          {membership?.status === 'active' ? 'Renew Membership' : 'Choose a Membership Plan'}
        </h2>
        <p className="mt-1 text-sm text-gray-400">Dummy checkout — no real charge is made.</p>
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
                  ${plan.price} <span className="text-sm font-normal capitalize text-gray-400">/ {plan.duration}</span>
                </p>
                <ul className="mt-3 space-y-1 text-xs text-gray-400">
                  {plan.features?.slice(0, 3).map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </motion.button>
            ))}
          </div>

          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handlePay}
            className="max-w-lg space-y-4 rounded-2xl border border-white/10 bg-surface/60 p-6"
          >
            <h3 className="text-sm font-semibold text-white">Dummy Card Details</h3>
            <input
              name="cardName"
              value={card.cardName}
              onChange={handleCardChange}
              required
              placeholder="Cardholder Name"
              className={inputClass}
            />
            <input
              name="cardNumber"
              value={card.cardNumber}
              onChange={handleCardChange}
              required
              maxLength={19}
              placeholder="Card Number (1234 5678 9012 3456)"
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-4">
              <input name="expiry" value={card.expiry} onChange={handleCardChange} required placeholder="MM/YY" className={inputClass} />
              <input name="cvv" value={card.cvv} onChange={handleCardChange} required placeholder="CVV" className={inputClass} />
            </div>

            <button
              type="submit"
              disabled={paying || !selectedPlan}
              className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {paying ? 'Processing payment...' : `Pay $${plans.find((p) => p._id === selectedPlan)?.price ?? ''}`}
            </button>
          </motion.form>
        </>
      )}
    </div>
  )
}

export default Payment
