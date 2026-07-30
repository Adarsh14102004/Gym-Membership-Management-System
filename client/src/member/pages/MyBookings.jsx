import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../../admin/components/DataTable.jsx'
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx'

const statusStyles = {
  booked: 'bg-accent-yellow/15 text-accent-yellow',
  cancelled: 'bg-white/10 text-gray-400',
}

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const { showToast } = useToast()

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/bookings/my')
      setBookings(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load bookings', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await api.put(`/bookings/${cancelTarget._id}/cancel`)
      showToast('Booking cancelled', 'success')
      setCancelTarget(null)
      fetchBookings()
    } catch (error) {
      showToast(error.response?.data?.message || 'Cancel failed', 'error')
    } finally {
      setCancelling(false)
    }
  }

  const rows = bookings.filter((b) => b.class?.title?.toLowerCase().includes(search.toLowerCase()))

  const columns = [
    { key: 'title', label: 'Class', render: (row) => row.class?.title || 'Deleted class' },
    { key: 'category', label: 'Category', render: (row) => row.class?.category || '—' },
    { key: 'date', label: 'Date', render: (row) => (row.class ? new Date(row.class.date).toLocaleDateString() : '—') },
    { key: 'time', label: 'Time', render: (row) => (row.class ? `${row.class.startTime} - ${row.class.endTime}` : '—') },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[row.status]}`}>{row.status}</span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) =>
        row.status === 'booked' ? (
          <button type="button" onClick={() => setCancelTarget(row)} className="font-medium text-accent-red hover:underline">
            Cancel
          </button>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">My Bookings</h2>
        <p className="mt-1 text-sm text-gray-400">Classes you've reserved.</p>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        page={1}
        pages={1}
        onPageChange={() => {}}
        emptyMessage="You haven't booked any classes yet"
      />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel Booking"
        message={`Cancel your booking for "${cancelTarget?.class?.title}"?`}
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={cancelling}
        confirmLabel="Yes, Cancel"
        loadingLabel="Cancelling..."
      />
    </div>
  )
}

export default MyBookings
