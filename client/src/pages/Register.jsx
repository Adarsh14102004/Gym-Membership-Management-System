import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const dashboardPath = (role) => {
  if (role === 'admin') return '/admin'
  if (role === 'trainer') return '/trainer'
  if (role === 'member') return '/member'
  return '/dashboard'
}

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    setSubmitting(true)
    try {
      const data = await register(form.name, form.email, form.password)
      showToast(`Welcome to FitZone, ${data.name}!`, 'success')
      navigate(dashboardPath(data.role))
    } catch (error) {
      showToast(error.response?.data?.message || 'Registration failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-73px)] md:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-16 md:px-8 md:order-1">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
          <p className="mt-2 text-sm text-gray-400">Join FitZone and start training today.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent-red"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent-red"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent-red"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent-red"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent-yellow hover:underline">
              Login
            </Link>
          </p>
        </motion.form>
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-bl from-accent-yellow/10 via-base to-accent-red/20 md:order-2 md:flex">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent-yellow/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent-red/20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative px-12 text-center"
        >
          <p className="text-3xl font-extrabold tracking-tight text-white">
            FIT<span className="text-accent-red">ZONE</span>
          </p>
          <h2 className="mt-6 text-2xl font-bold text-white">Start Your Transformation</h2>
          <p className="mt-3 text-gray-400">Sign up in seconds and get access to world-class training.</p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
