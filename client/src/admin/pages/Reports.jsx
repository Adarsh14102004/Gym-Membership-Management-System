import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const REPORT_TYPES = [
  { value: 'members', label: 'Member Data' },
  { value: 'payments', label: 'Payment Data' },
  { value: 'attendance', label: 'Attendance Data' },
]

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red'

const Reports = () => {
  const [type, setType] = useState('members')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [downloading, setDownloading] = useState('')
  const { showToast } = useToast()

  const download = async (format) => {
    setDownloading(format)
    try {
      const { data, headers } = await api.get(`/admin/reports/${format}`, {
        params: { type, from: from || undefined, to: to || undefined },
        responseType: 'blob',
      })

      const blob = new Blob([data], { type: headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showToast(`${format.toUpperCase()} report downloaded`, 'success')
    } catch (error) {
      showToast(error.response?.data?.message || `Failed to generate ${format.toUpperCase()} report`, 'error')
    } finally {
      setDownloading('')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Reports</h2>
        <p className="mt-1 text-sm text-gray-400">Export member, payment or attendance data as PDF or Excel.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 rounded-2xl border border-white/10 bg-surface/60 p-6"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Report Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">From Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">To Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => download('pdf')}
            disabled={!!downloading}
            className="rounded-full bg-accent-red px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105 disabled:opacity-60"
          >
            {downloading === 'pdf' ? 'Generating...' : 'Download PDF'}
          </button>
          <button
            type="button"
            onClick={() => download('excel')}
            disabled={!!downloading}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
          >
            {downloading === 'excel' ? 'Generating...' : 'Download Excel'}
          </button>
        </div>
      </motion.div>

      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-gray-400">
        <p className="font-semibold text-white">What's included</p>
        <ul className="mt-3 space-y-1.5">
          <li>
            <span className="text-gray-300">Member Data:</span> name, email, phone, status, plan, join date
          </li>
          <li>
            <span className="text-gray-300">Payment Data:</span> member, plan, amount, transaction ID, status, date
          </li>
          <li>
            <span className="text-gray-300">Attendance Data:</span> member, date, status, check-in time
          </li>
        </ul>
        <p className="mt-3 text-xs text-gray-500">Leave the date range empty to export all records.</p>
      </div>
    </div>
  )
}

export default Reports
