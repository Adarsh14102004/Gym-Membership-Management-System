import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'

const emptyForm = { name: '', email: '', subject: '', message: '' }

const inputClass =
  'w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent-red'

const Contact = () => {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/contact', form)
      showToast(data.message || 'Message sent!', 'success')
      setForm(emptyForm)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send message', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative overflow-hidden px-4 py-20 md:px-8">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-accent-red/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-accent-yellow/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent-yellow">
            Get In Touch
          </span>
          <h1 className="mt-6 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            We'd Love To <span className="text-accent-red">Hear From You</span>
          </h1>
          <p className="mt-4 max-w-md text-gray-400">
            Questions about membership, classes, or training? Send us a message and our team will get back to you
            shortly.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-gray-400">
            <li><span className="font-semibold text-white">Email:</span> hello@fitzone.com</li>
            <li><span className="font-semibold text-white">Phone:</span> +1 (555) 010-2024</li>
            <li><span className="font-semibold text-white">Hours:</span> Open 24/7</li>
          </ul>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-white/10 bg-surface/60 p-6 md:p-8"
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              required
              maxLength={100}
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={inputClass}
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
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-300">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              required
              maxLength={150}
              value={form.subject}
              onChange={handleChange}
              placeholder="Membership question"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-300">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              maxLength={2000}
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help?"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </motion.form>
      </div>
    </div>
  )
}

export default Contact
