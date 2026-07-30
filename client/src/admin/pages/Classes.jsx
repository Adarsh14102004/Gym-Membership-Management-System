import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const CATEGORIES = ['Yoga', 'Cardio', 'Strength', 'Zumba', 'HIIT', 'Pilates']

const emptyForm = {
  title: '',
  description: '',
  trainer: '',
  category: 'Yoga',
  date: '',
  startTime: '',
  endTime: '',
  capacity: '',
  status: 'upcoming',
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red'

const toDateInput = (date) => new Date(date).toISOString().slice(0, 10)

const Classes = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [trainers, setTrainers] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { showToast } = useToast()

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/classes', { params: { search, category, page, limit: 8 } })
      setRows(data.data)
      setPages(data.pages)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load classes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchClasses, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, page])

  useEffect(() => {
    api
      .get('/admin/trainers', { params: { limit: 100 } })
      .then(({ data }) => setTrainers(data.data))
      .catch(() => {})
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      title: row.title,
      description: row.description || '',
      trainer: row.trainer?._id || row.trainer,
      category: row.category,
      date: toDateInput(row.date),
      startTime: row.startTime,
      endTime: row.endTime,
      capacity: row.capacity,
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, capacity: Number(form.capacity) }
      if (editing) {
        await api.put(`/classes/${editing._id}`, payload)
        showToast('Class updated', 'success')
      } else {
        await api.post('/classes', payload)
        showToast('Class created', 'success')
      }
      setModalOpen(false)
      fetchClasses()
    } catch (error) {
      showToast(error.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/classes/${deleteTarget._id}`)
      showToast('Class deleted', 'success')
      setDeleteTarget(null)
      fetchClasses()
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'trainer', label: 'Trainer', render: (row) => row.trainer?.name || '—' },
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'time', label: 'Time', render: (row) => `${row.startTime} - ${row.endTime}` },
    { key: 'seats', label: 'Seats', render: (row) => `${row.bookedSeats}/${row.capacity}` },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            row.status === 'upcoming'
              ? 'bg-accent-yellow/15 text-accent-yellow'
              : row.status === 'cancelled'
                ? 'bg-accent-red/15 text-accent-red'
                : 'bg-white/10 text-gray-400'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Classes</h2>
          <p className="mt-1 text-sm text-gray-400">Create and schedule gym classes.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
        >
          Add Class
        </button>
      </div>

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
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        }
        page={page}
        pages={pages}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No classes scheduled yet"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={form.title} onChange={handleChange} required placeholder="Class title" className={inputClass} />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows={2}
            className={inputClass}
          />
          <select name="trainer" value={form.trainer} onChange={handleChange} required className={inputClass}>
            <option value="">Select trainer</option>
            {trainers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
          <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input name="date" type="date" value={form.date} onChange={handleChange} required className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input name="startTime" type="time" value={form.startTime} onChange={handleChange} required className={inputClass} />
            <input name="endTime" type="time" value={form.endTime} onChange={handleChange} required className={inputClass} />
          </div>
          <input
            name="capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={handleChange}
            required
            placeholder="Capacity"
            className={inputClass}
          />
          {editing && (
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Class'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete class "${deleteTarget?.title}"? All related bookings will be removed.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

export default Classes
