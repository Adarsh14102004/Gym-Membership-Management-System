import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../../admin/components/DataTable.jsx'
import Modal from '../../admin/components/Modal.jsx'
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const emptyForm = { member: '', title: '', exercises: [], day: 'Monday', duration: '', notes: '', status: 'active' }

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red'

const WorkoutPlans = () => {
  const [rows, setRows] = useState([])
  const [members, setMembers] = useState([])
  const [exercises, setExercises] = useState([])
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
      const { data } = await api.get('/trainer/workout-plans', { params: { search } })
      setRows(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load workout plans', 'error')
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

  const fetchExercises = async () => {
    try {
      const { data } = await api.get('/trainer/exercises', { params: { status: 'active' } })
      setExercises(data.data)
    } catch {
      // ignore, checklist will just be empty
    }
  }

  useEffect(() => {
    fetchMembers()
    fetchExercises()
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchPlans, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      exercises: (row.exercises || []).map((e) => e._id || e),
      day: row.day,
      duration: row.duration || '',
      notes: row.notes || '',
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const toggleExercise = (id) => {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.includes(id) ? prev.exercises.filter((x) => x !== id) : [...prev.exercises, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.exercises.length === 0) {
      showToast('Select at least one exercise', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, duration: form.duration ? Number(form.duration) : null }
      if (editing) {
        delete payload.member
        await api.put(`/trainer/workout-plans/${editing._id}`, payload)
        showToast('Workout plan updated', 'success')
      } else {
        await api.post('/trainer/workout-plans', payload)
        showToast('Workout plan created', 'success')
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
      await api.delete(`/trainer/workout-plans/${deleteTarget._id}`)
      showToast('Workout plan deleted', 'success')
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
    { key: 'day', label: 'Day' },
    { key: 'exercises', label: 'Exercises', render: (row) => `${row.exercises?.length || 0} items` },
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
          <h2 className="text-2xl font-bold text-white">Workout Plans</h2>
          <p className="mt-1 text-sm text-gray-400">Assign weekly workout plans built from your exercise library.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={members.length === 0 || exercises.length === 0}
          className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          Assign Workout
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
        emptyMessage="No workout plans yet"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Workout Plan' : 'Assign Workout Plan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <select name="member" value={form.member} onChange={handleChange} required className={inputClass}>
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
          <input name="title" value={form.title} onChange={handleChange} required placeholder="Plan title" className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <select name="day" value={form.day} onChange={handleChange} className={inputClass}>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              name="duration"
              type="number"
              min="0"
              value={form.duration}
              onChange={handleChange}
              placeholder="Duration (min)"
              className={inputClass}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-white">Exercises</p>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-base p-3">
              {exercises.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">Add exercises to your library first</p>
              ) : (
                exercises.map((ex) => (
                  <label
                    key={ex._id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={form.exercises.includes(ex._id)}
                      onChange={() => toggleExercise(ex._id)}
                      className="h-4 w-4 accent-accent-red"
                    />
                    <span className="text-white">{ex.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {ex.category} · {ex.muscleGroup}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Notes"
            className={inputClass}
          />
          {editing && (
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          )}
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
        message={`Delete workout plan "${deleteTarget?.title}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

export default WorkoutPlans
