import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Skeleton from '../../components/Skeleton.jsx'

const Settings = () => {
  const [notifyByEmail, setNotifyByEmail] = useState(true)
  const [loading, setLoading] = useState(true)
  const [savingPref, setSavingPref] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/member/profile')
        setNotifyByEmail(data.notifyByEmail)
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load settings', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleTogglePref = async () => {
    const next = !notifyByEmail
    setSavingPref(true)
    try {
      await api.put('/member/profile', { notifyByEmail: next })
      setNotifyByEmail(next)
      showToast('Preference updated', 'success')
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSavingPref(false)
    }
  }

  const handlePasswordChange = (e) => setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    setChangingPassword(true)
    try {
      await api.put('/member/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      showToast('Password changed successfully', 'success')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      showToast(error.response?.data?.message || 'Password change failed', 'error')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="mt-1 text-sm text-gray-400">Manage your account security and preferences.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Notification Preference</h3>
        {loading ? (
          <Skeleton className="h-10" />
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Email notifications</span>
            <button
              type="button"
              disabled={savingPref}
              onClick={handleTogglePref}
              className={`h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
                notifyByEmail ? 'bg-accent-red' : 'bg-white/10'
              }`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                  notifyByEmail ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handlePasswordSubmit}
        className="space-y-4 rounded-2xl border border-white/10 bg-surface/60 p-6"
      >
        <h3 className="text-sm font-semibold text-white">Change Password</h3>
        <input
          name="currentPassword"
          type="password"
          value={passwordForm.currentPassword}
          onChange={handlePasswordChange}
          required
          placeholder="Current password"
          className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
        />
        <input
          name="newPassword"
          type="password"
          value={passwordForm.newPassword}
          onChange={handlePasswordChange}
          required
          minLength={6}
          placeholder="New password"
          className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
        />
        <input
          name="confirmPassword"
          type="password"
          value={passwordForm.confirmPassword}
          onChange={handlePasswordChange}
          required
          minLength={6}
          placeholder="Confirm new password"
          className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
        />
        <button
          type="submit"
          disabled={changingPassword}
          className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {changingPassword ? 'Updating...' : 'Change Password'}
        </button>
      </motion.form>
    </div>
  )
}

export default Settings
