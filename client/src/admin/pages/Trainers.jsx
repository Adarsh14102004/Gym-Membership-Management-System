import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const emptyForm = { name: '', email: '', phone: '', password: '', specialization: '', status: 'active' }

const Trainers = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { showToast } = useToast()

  const fetchTrainers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/trainers', { params: { search, status, page, limit: 8 } })
      setRows(data.data)
      setPages(data.pages)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load trainers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchTrainers, 350)
    return () => clearTimeout(timer)
  }, [search, status, page])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      password: '',
      specialization: row.specialization || '',
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await api.put(`/admin/trainers/${editing._id}`, payload)
        showToast('Trainer updated', 'success')
      } else {
        await api.post('/admin/trainers', form)
        showToast('Trainer created', 'success')
      }
      setModalOpen(false)
      fetchTrainers()
    } catch (error) {
      showToast(error.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/trainers/${deleteTarget._id}`)
      showToast('Trainer deleted', 'success')
      setDeleteTarget(null)
      fetchTrainers()
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'specialization', label: 'Specialization', render: (row) => row.specialization || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            row.status === 'active' ? 'bg-accent-yellow/15 text-accent-yellow' : 'bg-white/10 text-gray-400'
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
          <h2 className="text-2xl font-bold text-white">Trainers</h2>
          <p className="mt-1 text-sm text-gray-400">Manage gym trainer accounts.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
        >
          Add Trainer
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
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        }
        page={page}
        pages={pages}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Trainer' : 'Add Trainer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Full name"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <input
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            placeholder="Specialization (e.g. Strength Coach)"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required={!editing}
            minLength={6}
            placeholder={editing ? 'New password (optional)' : 'Password'}
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Trainer'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete trainer "${deleteTarget?.name}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

export default Trainers
