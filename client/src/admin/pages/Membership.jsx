import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const emptyForm = { member: '', plan: '', startDate: '', amount: '', status: 'active' }

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red'

const statusStyles = {
  active: 'bg-accent-yellow/15 text-accent-yellow',
  expired: 'bg-accent-red/15 text-accent-red',
  cancelled: 'bg-white/10 text-gray-400',
  pending: 'bg-white/10 text-gray-300',
}

const toDateInput = (date) => new Date(date).toISOString().slice(0, 10)

const Membership = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [renewingId, setRenewingId] = useState(null)
  const [checkingExpiry, setCheckingExpiry] = useState(false)

  const { showToast } = useToast()

  const fetchMemberships = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/memberships', { params: { search, status, page, limit: 8 } })
      setRows(data.data)
      setPages(data.pages)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load memberships', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchMemberships, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page])

  useEffect(() => {
    api.get('/admin/members', { params: { limit: 100 } }).then(({ data }) => setMembers(data.data)).catch(() => {})
    api.get('/admin/plans').then(({ data }) => setPlans(data)).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      member: row.member?._id || '',
      plan: row.plan?._id || '',
      startDate: toDateInput(row.startDate),
      amount: row.amount,
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'plan' && !editing) {
        const planDoc = plans.find((p) => p._id === value)
        if (planDoc) next.amount = planDoc.price
      }
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/admin/memberships/${editing._id}`, form)
        showToast('Membership updated', 'success')
      } else {
        await api.post('/admin/memberships', form)
        showToast('Membership created', 'success')
      }
      setModalOpen(false)
      fetchMemberships()
    } catch (error) {
      showToast(error.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/memberships/${deleteTarget._id}`)
      showToast('Membership deleted', 'success')
      setDeleteTarget(null)
      fetchMemberships()
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleRenew = async (row) => {
    setRenewingId(row._id)
    try {
      await api.put(`/admin/memberships/${row._id}/renew`)
      showToast('Membership renewed', 'success')
      fetchMemberships()
    } catch (error) {
      showToast(error.response?.data?.message || 'Renew failed', 'error')
    } finally {
      setRenewingId(null)
    }
  }

  const handleCheckExpiry = async () => {
    setCheckingExpiry(true)
    try {
      const { data } = await api.get('/admin/memberships/check-expiry')
      showToast(`Expiry check complete — ${data.updated} membership(s) marked expired`, 'success')
      fetchMemberships()
    } catch (error) {
      showToast(error.response?.data?.message || 'Expiry check failed', 'error')
    } finally {
      setCheckingExpiry(false)
    }
  }

  const columns = [
    { key: 'member', label: 'Member', render: (row) => row.member?.name || '—' },
    { key: 'plan', label: 'Plan', render: (row) => row.plan?.name || '—' },
    { key: 'startDate', label: 'Start', render: (row) => new Date(row.startDate).toLocaleDateString() },
    { key: 'endDate', label: 'Expiry', render: (row) => new Date(row.endDate).toLocaleDateString() },
    { key: 'amount', label: 'Amount', render: (row) => `₹${row.amount}` },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[row.status]}`}>{row.status}</span>
      ),
    },
    {
      key: 'renew',
      label: '',
      render: (row) => (
        <button
          type="button"
          disabled={renewingId === row._id}
          onClick={() => handleRenew(row)}
          className="font-medium text-accent-yellow hover:underline disabled:opacity-50"
        >
          {renewingId === row._id ? 'Renewing...' : 'Renew'}
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Membership Management</h2>
          <p className="mt-1 text-sm text-gray-400">Track member subscriptions, renewals and expiry.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCheckExpiry}
            disabled={checkingExpiry}
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:text-white disabled:opacity-60"
          >
            {checkingExpiry ? 'Checking...' : 'Run Expiry Check'}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
          >
            Add Membership
          </button>
        </div>
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
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        }
        page={page}
        pages={pages}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No memberships recorded yet"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Membership' : 'Add Membership'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select name="member" value={form.member} onChange={handleChange} required disabled={!!editing} className={inputClass}>
            <option value="">Select member</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
          <select name="plan" value={form.plan} onChange={handleChange} required className={inputClass}>
            <option value="">Select plan</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — {p.price}/{p.duration}
              </option>
            ))}
          </select>
          <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required className={inputClass} />
          <input
            name="amount"
            type="number"
            min="0"
            value={form.amount}
            onChange={handleChange}
            required
            placeholder="Amount paid"
            className={inputClass}
          />
          {editing && (
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Membership'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete membership record for "${deleteTarget?.member?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

export default Membership
