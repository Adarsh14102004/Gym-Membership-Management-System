import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../../admin/components/DataTable.jsx'
import Modal from '../../admin/components/Modal.jsx'
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx'

const emptyForm = { member: '', title: '', meals: '', notes: '', status: 'active' }

const DietPlans = () => {
  const [rows, setRows] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
      const { data } = await api.get('/trainer/diet-plans', { params: { search } })
      setRows(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load diet plans', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/trainer/members', { params: { limit: 100 } })
      setMembers(data.data)
    } catch {
      // ignore, dropdown will just be empty
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchPlans, 350)
    return () => clearTimeout(timer)
  }, [search])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      member: row.member?._id || '',
      title: row.title,
      meals: (row.meals || []).join('\n'),
      notes: row.notes || '',
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        meals: form.meals
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      }
      if (editing) {
        delete payload.member
        await api.put(`/trainer/diet-plans/${editing._id}`, payload)
        showToast('Diet plan updated', 'success')
      } else {
        await api.post('/trainer/diet-plans', payload)
        showToast('Diet plan created', 'success')
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
      await api.delete(`/trainer/diet-plans/${deleteTarget._id}`)
      showToast('Diet plan deleted', 'success')
      setDeleteTarget(null)
      fetchPlans()
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'member', label: 'Member', render: (row) => row.member?.name || '—' },
    { key: 'meals', label: 'Meals', render: (row) => `${row.meals?.length || 0} items` },
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
          <h2 className="text-2xl font-bold text-white">Diet Plans</h2>
          <p className="mt-1 text-sm text-gray-400">Create and manage diet plans for your members.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={members.length === 0}
          className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
        page={1}
        pages={1}
        onPageChange={() => {}}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No diet plans yet"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Diet Plan' : 'Add Diet Plan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <select
              name="member"
              value={form.member}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
            >
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Plan title"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <textarea
            name="meals"
            value={form.meals}
            onChange={handleChange}
            rows={4}
            placeholder={'One meal per line, e.g.\nBreakfast - Oats and fruit\nLunch - Chicken and rice'}
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Notes"
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white outline-none focus:border-accent-red"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
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
        message={`Delete diet plan "${deleteTarget?.title}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

export default DietPlans
