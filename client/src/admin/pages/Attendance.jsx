import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../components/DataTable.jsx'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red'

const Attendance = () => {
  const [qrValue, setQrValue] = useState('')
  const [scanning, setScanning] = useState(false)
  const [todayCount, setTodayCount] = useState(0)

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const { showToast } = useToast()

  const fetchToday = async () => {
    try {
      const { data } = await api.get('/admin/attendance/today')
      setTodayCount(data.length)
    } catch {
      /* non-blocking */
    }
  }

  const fetchReport = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/attendance', { params: { search, date, page, limit: 10 } })
      setRows(data.data)
      setPages(data.pages)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load attendance', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchToday()
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchReport, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, date, page])

  const handleScan = async (e) => {
    e.preventDefault()
    if (!qrValue.trim()) return
    setScanning(true)
    try {
      const { data } = await api.post('/admin/attendance/scan', { qrValue: qrValue.trim() })
      showToast(`${data.memberName} checked in successfully`, 'success')
      setQrValue('')
      fetchToday()
      fetchReport()
    } catch (error) {
      showToast(error.response?.data?.message || 'Check-in failed', 'error')
    } finally {
      setScanning(false)
    }
  }

  const columns = [
    { key: 'member', label: 'Member', render: (row) => row.member?.name || '—' },
    { key: 'email', label: 'Email', render: (row) => row.member?.email || '—' },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className="rounded-full bg-accent-yellow/15 px-3 py-1 text-xs font-semibold capitalize text-accent-yellow">
          {row.status}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Attendance Management</h2>
        <p className="mt-1 text-sm text-gray-400">Scan member QR codes and review attendance history.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface/60 p-6 sm:flex-row sm:items-end sm:justify-between">
        <form onSubmit={handleScan} className="flex w-full flex-col gap-3 sm:max-w-md">
          <label className="text-sm font-semibold text-white">Scan / Enter Member QR Code</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              autoFocus
              placeholder="Scan QR or paste member code"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={scanning}
              className="flex-none rounded-xl bg-accent-red px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
            >
              {scanning ? 'Checking...' : 'Mark Attendance'}
            </button>
          </div>
        </form>
        <div className="rounded-2xl bg-base px-6 py-4 text-center">
          <p className="text-xs uppercase tracking-wide text-gray-500">Checked In Today</p>
          <p className="mt-1 text-3xl font-extrabold text-accent-yellow">{todayCount}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Attendance Report</h3>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          search={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          filters={
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
            />
          }
          page={page}
          pages={pages}
          onPageChange={setPage}
          emptyMessage="No attendance records found"
        />
      </div>
    </div>
  )
}

export default Attendance
