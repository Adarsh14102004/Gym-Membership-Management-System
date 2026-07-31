import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../../admin/components/DataTable.jsx'
import Modal from '../../admin/components/Modal.jsx'

const FILE_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')
const fileUrl = (p) => (p ? `${FILE_BASE_URL}${p}` : '')

const statusStyles = {
  pending: 'bg-accent-yellow/15 text-accent-yellow',
  approved: 'bg-green-500/15 text-green-400',
  rejected: 'bg-accent-red/15 text-accent-red',
}

const MeasureRow = ({ label, prev, current, unit = '' }) => {
  if (current == null && prev == null) return null
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-white">
        {prev != null && <span className="mr-2 text-gray-500 line-through decoration-gray-600">{prev}{unit}</span>}
        {current != null ? `${current}${unit}` : '—'}
      </span>
    </div>
  )
}

const ProgressApproval = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('pending')
  const [search, setSearch] = useState('')

  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [previousEntry, setPreviousEntry] = useState(null)

  const { showToast } = useToast()

  const fetchProgress = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/trainer/progress', { params: { status } })
      setRows(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load progress logs', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
  }, [status])

  const openReview = async (row) => {
    setReviewTarget(row)
    setReviewNote('')
    setPreviousEntry(null)
    try {
      const { data } = await api.get(`/trainer/progress/member/${row.member._id}`)
      const history = data.filter((d) => d._id !== row._id && new Date(d.createdAt) < new Date(row.createdAt))
      setPreviousEntry(history[history.length - 1] || null)
    } catch {
      setPreviousEntry(null)
    }
  }

  const handleReview = async (decision) => {
    setReviewing(true)
    try {
      await api.put(`/trainer/progress/${reviewTarget._id}/review`, { status: decision, trainerNote: reviewNote })
      showToast(`Progress ${decision}`, 'success')
      setReviewTarget(null)
      fetchProgress()
    } catch (error) {
      showToast(error.response?.data?.message || 'Review failed', 'error')
    } finally {
      setReviewing(false)
    }
  }

  const columns = [
    {
      key: 'progressImage',
      label: 'Photo',
      render: (row) =>
        row.progressImage ? (
          <img src={fileUrl(row.progressImage)} alt="" className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <span className="text-gray-600">—</span>
        ),
    },
    { key: 'member', label: 'Member', render: (row) => row.member?.name || '—' },
    { key: 'weight', label: 'Weight', render: (row) => (row.weight != null ? `${row.weight} kg` : '—') },
    { key: 'bmi', label: 'BMI', render: (row) => row.bmi ?? '—' },
    { key: 'bodyFat', label: 'Body Fat', render: (row) => (row.bodyFat != null ? `${row.bodyFat}%` : '—') },
    { key: 'notes', label: 'Notes', render: (row) => row.notes || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status]}`}>{row.status}</span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) =>
        row.status === 'pending' ? (
          <button type="button" onClick={() => openReview(row)} className="font-medium text-accent-yellow hover:underline">
            Review
          </button>
        ) : (
          <button type="button" onClick={() => openReview(row)} className="text-gray-500 hover:text-white">
            {row.trainerNote ? 'Commented' : 'View'}
          </button>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Progress Approval</h2>
          <p className="mt-1 text-sm text-gray-400">Review weight, measurements and photo updates submitted by your members.</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={rows.filter((r) => r.member?.name?.toLowerCase().includes(search.toLowerCase()))}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        page={1}
        pages={1}
        onPageChange={() => {}}
        emptyMessage="No progress logs found"
      />

      <Modal open={!!reviewTarget} onClose={() => setReviewTarget(null)} title="Review Progress">
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            <span className="text-gray-500">Member: </span>
            <span className="text-white">{reviewTarget?.member?.name}</span>
          </p>

          {reviewTarget?.progressImage && (
            <div className="flex gap-3">
              {previousEntry?.progressImage && (
                <div>
                  <p className="mb-1 text-xs text-gray-500">Previous</p>
                  <img src={fileUrl(previousEntry.progressImage)} alt="Previous" className="h-24 w-24 rounded-xl object-cover" />
                </div>
              )}
              <div>
                <p className="mb-1 text-xs text-gray-500">Current</p>
                <img src={fileUrl(reviewTarget.progressImage)} alt="Current" className="h-24 w-24 rounded-xl object-cover" />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-base p-3">
            <MeasureRow label="Weight" prev={previousEntry?.weight} current={reviewTarget?.weight} unit=" kg" />
            <MeasureRow label="BMI" prev={previousEntry?.bmi} current={reviewTarget?.bmi} />
            <MeasureRow label="Body Fat" prev={previousEntry?.bodyFat} current={reviewTarget?.bodyFat} unit="%" />
            <MeasureRow label="Chest" prev={previousEntry?.chest} current={reviewTarget?.chest} unit=" cm" />
            <MeasureRow label="Waist" prev={previousEntry?.waist} current={reviewTarget?.waist} unit=" cm" />
            <MeasureRow label="Arms" prev={previousEntry?.arms} current={reviewTarget?.arms} unit=" cm" />
            <MeasureRow label="Thighs" prev={previousEntry?.thighs} current={reviewTarget?.thighs} unit=" cm" />
          </div>

          {reviewTarget?.notes && (
            <p>
              <span className="text-gray-500">Notes: </span>
              {reviewTarget.notes}
            </p>
          )}

          {reviewTarget?.status !== 'pending' && reviewTarget?.trainerNote && (
            <p>
              <span className="text-gray-500">Your feedback: </span>
              {reviewTarget.trainerNote}
            </p>
          )}
        </div>

        {reviewTarget?.status === 'pending' && (
          <>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
              placeholder="Add feedback for the member (optional)"
              className="mt-4 w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleReview('rejected')}
                disabled={reviewing}
                className="rounded-full border border-accent-red/40 px-5 py-2 text-sm font-semibold text-accent-red transition-colors hover:bg-accent-red/10 disabled:opacity-60"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleReview('approved')}
                disabled={reviewing}
                className="rounded-full bg-accent-red px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {reviewing ? 'Saving...' : 'Approve'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default ProgressApproval
