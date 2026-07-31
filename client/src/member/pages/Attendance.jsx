import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../../admin/components/DataTable.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import Chart from '../../admin/components/Chart.jsx'

const Attendance = () => {
  const [today, setToday] = useState(null)
  const [records, setRecords] = useState([])
  const [qr, setQr] = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [search, setSearch] = useState('')
  const { showToast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [todayRes, historyRes, qrRes, monthlyRes] = await Promise.all([
        api.get('/member/attendance/today'),
        api.get('/member/attendance'),
        api.get('/member/attendance/qr'),
        api.get('/member/attendance/monthly'),
      ])
      setToday(todayRes.data)
      setRecords(historyRes.data)
      setQr(qrRes.data)
      setMonthly(monthlyRes.data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load attendance', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      await api.post('/member/attendance/checkin')
      showToast('Checked in for today!', 'success')
      load()
    } catch (error) {
      showToast(error.response?.data?.message || 'Check-in failed', 'error')
    } finally {
      setCheckingIn(false)
    }
  }

  const columns = [
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Attendance</h2>
          <p className="mt-1 text-sm text-gray-400">Track your gym visits.</p>
        </div>
        {loading ? (
          <Skeleton className="h-10 w-32" />
        ) : today.checkedIn ? (
          <span className="rounded-full bg-accent-yellow/15 px-5 py-2.5 text-sm font-semibold text-accent-yellow">
            Checked In Today
          </span>
        ) : (
          <button
            type="button"
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105 disabled:opacity-60"
          >
            {checkingIn ? 'Checking in...' : 'Check In Now'}
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface/60 p-6 sm:flex-row sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">My Check-In QR Code</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-400">
            Show this code at the front desk on arrival. Reception scans it to mark your attendance instantly.
          </p>
        </div>
        {loading ? (
          <Skeleton className="h-40 w-40 flex-none" />
        ) : (
          qr?.image && (
            <div className="flex-none rounded-2xl bg-white p-3 shadow-lg shadow-black/30">
              <img src={qr.image} alt="Your check-in QR code" className="h-36 w-36" />
            </div>
          )
        )}
      </div>

      {monthly && (
        <Chart
          title="Monthly Attendance"
          subtitle={`${monthly.count} check-in${monthly.count === 1 ? '' : 's'} in ${monthly.month}`}
          data={
            monthly.records.length
              ? (() => {
                  const [year, month] = monthly.month.split('-').map(Number)
                  const daysInMonth = new Date(year, month, 0).getDate()
                  const presentDays = new Set(monthly.records.map((r) => Number(r.date.split('-')[2])))
                  return Array.from({ length: daysInMonth }, (_, i) => (presentDays.has(i + 1) ? 1 : 0))
                })()
              : [0]
          }
        />
      )}

      <DataTable
        columns={columns}
        rows={records.filter((r) => r.date.includes(search))}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        page={1}
        pages={1}
        onPageChange={() => {}}
        emptyMessage="No attendance records yet"
      />
    </div>
  )
}

export default Attendance
