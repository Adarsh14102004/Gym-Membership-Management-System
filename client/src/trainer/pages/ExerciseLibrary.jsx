import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import DataTable from '../../admin/components/DataTable.jsx'
import Modal from '../../admin/components/Modal.jsx'
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx'

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

const emptyForm = {
  name: '',
  category: 'Strength',
  muscleGroup: 'Full Body',
  difficulty: 'Beginner',
  sets: '',
  reps: '',
  duration: '',
  video: '',
  image: '',
  description: '',
  status: 'active',
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red'

const ExerciseLibrary = () => {
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [muscleGroups, setMuscleGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [difficulty, setDifficulty] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { showToast } = useToast()

  const fetchExercises = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/trainer/exercises', { params: { search, category, muscleGroup, difficulty } })
      setRows(data.data)
      setCategories(data.categories)
      setMuscleGroups(data.muscleGroups)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load exercises', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchExercises, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, muscleGroup, difficulty])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name,
      category: row.category,
      muscleGroup: row.muscleGroup,
      difficulty: row.difficulty,
      sets: row.sets || '',
      reps: row.reps || '',
      duration: row.duration || '',
      video: row.video || '',
      image: row.image || '',
      description: row.description || '',
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
        sets: form.sets ? Number(form.sets) : null,
        reps: form.reps ? Number(form.reps) : null,
        duration: form.duration ? Number(form.duration) : null,
      }
      if (editing) {
        await api.put(`/trainer/exercises/${editing._id}`, payload)
        showToast('Exercise updated', 'success')
      } else {
        await api.post('/trainer/exercises', payload)
        showToast('Exercise added', 'success')
      }
      setModalOpen(false)
      fetchExercises()
    } catch (error) {
      showToast(error.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/trainer/exercises/${deleteTarget._id}`)
      showToast('Exercise deleted', 'success')
      setDeleteTarget(null)
      fetchExercises()
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'muscleGroup', label: 'Muscle Group' },
    { key: 'difficulty', label: 'Difficulty' },
    {
      key: 'prescription',
      label: 'Sets/Reps',
      render: (row) => (row.sets || row.reps ? `${row.sets || 0}x${row.reps || 0}` : row.duration ? `${row.duration} min` : '—'),
    },
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
          <h2 className="text-2xl font-bold text-white">Exercise Library</h2>
          <p className="mt-1 text-sm text-gray-400">Build your reusable catalog of exercises for workout plans.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
        >
          Add Exercise
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        filters={
          <div className="flex flex-wrap gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} className={inputClass}>
              <option value="">All Muscle Groups</option>
              {muscleGroups.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={inputClass}>
              <option value="">All Difficulties</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        }
        page={1}
        pages={1}
        onPageChange={() => {}}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No exercises in your library yet"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Exercise' : 'Add Exercise'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Exercise name" className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {categories.length
                ? categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                : ['Strength', 'Cardio', 'Flexibility', 'Balance', 'Core'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
            </select>
            <select name="muscleGroup" value={form.muscleGroup} onChange={handleChange} className={inputClass}>
              {muscleGroups.length
                ? muscleGroups.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))
                : ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
            </select>
          </div>
          <select name="difficulty" value={form.difficulty} onChange={handleChange} className={inputClass}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-3">
            <input name="sets" type="number" min="0" value={form.sets} onChange={handleChange} placeholder="Sets" className={inputClass} />
            <input name="reps" type="number" min="0" value={form.reps} onChange={handleChange} placeholder="Reps" className={inputClass} />
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
          <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL (optional)" className={inputClass} />
          <input name="video" value={form.video} onChange={handleChange} placeholder="Video URL (optional)" className={inputClass} />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Description / instructions"
            className={inputClass}
          />
          {editing && (
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Exercise'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete exercise "${deleteTarget?.name}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

export default ExerciseLibrary
