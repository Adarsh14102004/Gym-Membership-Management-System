import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const emptyForm = { name: '', price: '', duration: 'monthly', features: '', popular: false, status: 'active' }

const Plans = () => {
  const [allPlans, setAllPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { showToast } = useToast()

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/plans', { params: { search } })
      setAllPlans(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load plans', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchPlans, 350)
    return () => clearTimeout(timer)
  }, [search])

  const rows = status ? allPlans.filter((p) => p.status === status) : allPlans

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name,
      price: row.price,
      duration: row.duration,
      features: (row.features || []).join(', '),
      popular: row.popular,
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        features: form.features
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
      }
      if (editing) {
        await api.put(`/admin/plans/${editing._id}`, payload)
        showToast('Plan updated', 'success')
      } else {
        await api.post('/admin/plans', payload)
        showToast('Plan created', 'success')
      }
      setModalOpen(false)
      fetchPlans()
    } catch (error) {
      showToast(error.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/plans/${deleteTarget._id}`)
      showToast('Plan deleted', 'success')
      setDeleteTarget(null)
      fetchPlans()
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price', render: (row) => `$${row.price}` },
    { key: 'duration', label: 'Duration' },
    { key: 'popular', label: 'Popular', render: (row) => (row.popular ? 'Yes' : 'No') },
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
          <h2 className="text-2xl font-bold text-white">Membership Plans</h2>
          <p className="mt-1 text-sm text-gray-400">Manage pricing plans offered to members.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
        >
          Add Plan
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        filters={
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        }
        page={1}
        pages={1}
        onPageChange={() => {}}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Plan' : 'Add Plan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Plan name"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <input
            name="price"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
            placeholder="Price (USD)"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <select
            name="duration"
            value={form.duration}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            name="features"
            value={form.features}
            onChange={handleChange}
            placeholder="Features, comma separated"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" name="popular" checked={form.popular} onChange={handleChange} className="h-4 w-4 accent-accent-red" />
            Mark as most popular
          </label>
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
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete plan "${deleteTarget?.name}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

export default Plans
