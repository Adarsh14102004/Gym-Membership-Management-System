import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Skeleton from '../../components/Skeleton.jsx'

const emptyForm = { name: '', phone: '', address: '', height: '', profilePicture: '' }

const Profile = () => {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/member/profile')
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          height: data.height || '',
          profilePicture: data.profilePicture || '',
        })
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load profile', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/member/profile', { ...form, height: form.height ? Number(form.height) : null })
      showToast('Profile updated', 'success')
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Profile</h2>
        <p className="mt-1 text-sm text-gray-400">Update your personal information.</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-white/10 bg-surface/60 p-6"
      >
        <div className="flex items-center gap-4">
          {form.profilePicture ? (
            <img src={form.profilePicture} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-red text-xl font-bold text-white">
              {form.name?.[0]?.toUpperCase()}
            </div>
          )}
          <input
            name="profilePicture"
            value={form.profilePicture}
            onChange={handleChange}
            placeholder="Profile picture URL"
            className="flex-1 rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Height (cm)</label>
          <input
            name="height"
            type="number"
            value={form.height}
            onChange={handleChange}
            placeholder="Used to calculate your BMI"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.form>
    </div>
  )
}

export default Profile
