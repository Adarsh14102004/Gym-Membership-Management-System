import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../../admin/components/DataTable.jsx'

const MemberAttendance = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const { showToast } = useToast()

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/trainer/attendance', { params: { date } })
      setRecords(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load attendance', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const rows = records.filter(
    (r) =>
      r.member?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.member?.email?.toLowerCase().includes(search.toLowerCase())
  )

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
        <h2 className="text-2xl font-bold text-white">Member Attendance</h2>
        <p className="mt-1 text-sm text-gray-400">Attendance records for members assigned to you.</p>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        filters={
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
          />
        }
        page={1}
        pages={1}
        onPageChange={() => {}}
        emptyMessage="No attendance records found"
      />
    </div>
  )
}

export default MemberAttendance
