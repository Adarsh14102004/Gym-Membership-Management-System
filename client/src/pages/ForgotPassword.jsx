import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      showToast(data.message || 'Check your email for a reset link', 'success')
      setSent(true)
    } catch (error) {
      showToast(error.response?.data?.message || 'Something went wrong', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-73px)] md:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-accent-red/20 via-base to-accent-yellow/10 md:flex">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-accent-red/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-accent-yellow/10 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative px-12 text-center"
        >
          <p className="text-3xl font-extrabold tracking-tight text-white">
            FIT<span className="text-accent-red">ZONE</span>
          </p>
          <h2 className="mt-6 text-2xl font-bold text-white">Forgot Your Password?</h2>
          <p className="mt-3 text-gray-400">No worries — we'll email you a link to reset it.</p>
        </motion.div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 md:px-8">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
          <p className="mt-2 text-sm text-gray-400">Enter the email associated with your account.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent-red"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || sent}
            className="mt-8 w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? 'Sending link...' : sent ? 'Link sent — check your email' : 'Send Reset Link'}
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-accent-yellow hover:underline">
              Back to Login
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  )
}

export default ForgotPassword
