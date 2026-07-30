import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import DataTable from '../../admin/components/DataTable.jsx'
import Modal from '../../admin/components/Modal.jsx'
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const statusStyles = {
  pending: 'bg-accent-yellow/15 text-accent-yellow',
  approved: 'bg-green-500/15 text-green-400',
  rejected: 'bg-accent-red/15 text-accent-red',
}

const categoryStyles = {
  Underweight: 'bg-white/10 text-gray-300',
  Normal: 'bg-accent-yellow/15 text-accent-yellow',
  Overweight: 'bg-accent-red/10 text-accent-red/80',
  Obese: 'bg-accent-red/15 text-accent-red',
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red'

const calcBmi = (weight, height) => (weight && height ? Number((weight / (height / 100) ** 2).toFixed(1)) : null)

const bmiCategory = (bmi) => {
  if (bmi == null) return null
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.06)' } },
    y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.06)' } },
  },
}

const ProgressRing = ({ percent, color = '#ffd60a' }) => {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.max(0, Math.min(100, percent)) / 100) * circumference

  return (
    <div className="relative h-[120px] w-[120px]">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-extrabold text-white">{percent}%</div>
    </div>
  )
}

const GlassCard = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className={`rounded-2xl border border-white/10 bg-surface/60 p-6 backdrop-blur-sm transition-colors hover:border-white/20 ${className}`}
  >
    {children}
  </motion.div>
)

const emptyEntry = { weight: '', height: '', bodyFat: '', notes: '' }
const emptyGoal = { goal: '', targetWeight: '', targetDate: '' }

const Progress = () => {
  const [logs, setLogs] = useState([])
  const [workoutHistory, setWorkoutHistory] = useState([])
  const [goal, setGoal] = useState(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState(emptyEntry)
  const [submitting, setSubmitting] = useState(false)
  const [historySearch, setHistorySearch] = useState('')

  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState(emptyEntry)
  const [editSaving, setEditSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [goalForm, setGoalForm] = useState(emptyGoal)
  const [goalSaving, setGoalSaving] = useState(false)
  const [cancellingGoal, setCancellingGoal] = useState(false)

  const { showToast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [progressRes, historyRes, goalRes] = await Promise.all([
        api.get('/progress/mine'),
        api.get('/member/workout-history'),
        api.get('/member/goal'),
      ])
      setLogs(progressRes.data)
      setWorkoutHistory(historyRes.data)
      setGoal(goalRes.data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load progress', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const latest = logs[logs.length - 1] || null
  const livePreviewBmi = useMemo(() => calcBmi(Number(form.weight), Number(form.height)), [form.weight, form.height])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/progress', {
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
        notes: form.notes,
      })
      showToast('Weight entry logged', 'success')
      setForm(emptyEntry)
      load()
    } catch (error) {
      showToast(error.response?.data?.message || 'Submission failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (row) => {
    setEditTarget(row)
    setEditForm({ weight: row.weight ?? '', height: row.height ?? '', bodyFat: row.bodyFat ?? '', notes: row.notes || '' })
  }

  const handleEditChange = (e) => setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditSaving(true)
    try {
      await api.put(`/progress/${editTarget._id}`, {
        weight: editForm.weight ? Number(editForm.weight) : undefined,
        height: editForm.height ? Number(editForm.height) : undefined,
        bodyFat: editForm.bodyFat ? Number(editForm.bodyFat) : undefined,
        notes: editForm.notes,
      })
      showToast('Entry updated', 'success')
      setEditTarget(null)
      load()
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error')
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/progress/${deleteTarget._id}`)
      showToast('Entry deleted', 'success')
      setDeleteTarget(null)
      load()
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const openGoalModal = () => {
    setGoalForm(
      goal
        ? { goal: goal.goal, targetWeight: goal.targetWeight, targetDate: new Date(goal.targetDate).toISOString().slice(0, 10) }
        : emptyGoal
    )
    setGoalModalOpen(true)
  }

  const handleGoalChange = (e) => setGoalForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleGoalSubmit = async (e) => {
    e.preventDefault()
    setGoalSaving(true)
    try {
      const payload = { ...goalForm, targetWeight: Number(goalForm.targetWeight) }
      if (goal) {
        await api.put(`/member/goal/${goal._id}`, payload)
        showToast('Goal updated', 'success')
      } else {
        await api.post('/member/goal', payload)
        showToast('Goal set', 'success')
      }
      setGoalModalOpen(false)
      load()
    } catch (error) {
      showToast(error.response?.data?.message || 'Save failed', 'error')
    } finally {
      setGoalSaving(false)
    }
  }

  const handleCancelGoal = async () => {
    setCancellingGoal(true)
    try {
      await api.delete(`/member/goal/${goal._id}`)
      showToast('Goal removed', 'success')
      load()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to remove goal', 'error')
    } finally {
      setCancellingGoal(false)
    }
  }

  const weightChartData = {
    labels: logs.map((l) => new Date(l.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: logs.map((l) => l.weight),
        borderColor: '#ff3b30',
        backgroundColor: 'rgba(255,59,48,0.2)',
        tension: 0.3,
      },
    ],
  }

  const bmiChartData = {
    labels: logs.map((l) => new Date(l.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'BMI',
        data: logs.map((l) => l.bmi),
        borderColor: '#ffd60a',
        backgroundColor: 'rgba(255,214,10,0.2)',
        tension: 0.3,
      },
    ],
  }

  const frequencyCounts = DAYS.map((day) => workoutHistory.filter((h) => h.workoutPlan?.day === day).length)
  const frequencyChartData = {
    labels: DAYS.map((d) => d.slice(0, 3)),
    datasets: [{ label: 'Workouts', data: frequencyCounts, backgroundColor: '#ff3b30' }],
  }

  const historyColumns = [
    { key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'weight', label: 'Weight (kg)', render: (row) => row.weight ?? '—' },
    { key: 'bmi', label: 'BMI', render: (row) => row.bmi ?? '—' },
    { key: 'bodyFat', label: 'Body Fat', render: (row) => (row.bodyFat != null ? `${row.bodyFat}%` : '—') },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status]}`}>{row.status}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3">
          {row.status === 'pending' && (
            <button type="button" onClick={() => openEdit(row)} className="font-medium text-accent-yellow hover:underline">
              Edit
            </button>
          )}
          <button type="button" onClick={() => setDeleteTarget(row)} className="font-medium text-accent-red hover:underline">
            Delete
          </button>
        </div>
      ),
    },
  ]

  const workoutColumns = [
    { key: 'title', label: 'Workout', render: (row) => row.workoutPlan?.title || 'Deleted plan' },
    { key: 'duration', label: 'Duration', render: (row) => (row.duration ? `${row.duration} min` : '—') },
    { key: 'calories', label: 'Calories', render: (row) => (row.caloriesBurned ? `${row.caloriesBurned} kcal` : '—') },
    { key: 'completedAt', label: 'Completed', render: (row) => new Date(row.completedAt).toLocaleDateString() },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Fitness Progress</h2>
        <p className="mt-1 text-sm text-gray-400">Track your weight, BMI, goals and workout consistency.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <GlassCard>
          <p className="text-sm text-gray-400">Current Weight</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{latest?.weight ? `${latest.weight} kg` : '—'}</p>
          <p className="mt-1 text-xs text-gray-500">{latest ? new Date(latest.createdAt).toLocaleDateString() : 'No entries yet'}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-gray-400">BMI</p>
          <p className="mt-2 text-3xl font-extrabold text-accent-yellow">{latest?.bmi ?? '—'}</p>
          {latest?.bmi != null && (
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[bmiCategory(latest.bmi)]}`}>
              {bmiCategory(latest.bmi)}
            </span>
          )}
        </GlassCard>
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Goal Progress</p>
            <p className="mt-2 text-lg font-bold text-white">{goal?.goal || 'No active goal'}</p>
            {goal && <p className="mt-1 text-xs text-gray-500">{goal.remaining} kg to go</p>}
          </div>
          {goal && <ProgressRing percent={goal.progress} />}
        </GlassCard>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-white/10 bg-surface/60 p-6 sm:grid-cols-4"
      >
        <input
          name="weight"
          type="number"
          step="0.1"
          value={form.weight}
          onChange={handleChange}
          required
          placeholder="Weight (kg)"
          className={inputClass}
        />
        <input
          name="height"
          type="number"
          step="0.1"
          value={form.height}
          onChange={handleChange}
          placeholder="Height (cm, optional)"
          className={inputClass}
        />
        <input
          name="bodyFat"
          type="number"
          step="0.1"
          value={form.bodyFat}
          onChange={handleChange}
          placeholder="Body Fat % (optional)"
          className={inputClass}
        />
        <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes (optional)" className={inputClass} />

        {livePreviewBmi != null && (
          <p className="sm:col-span-4 text-sm text-gray-400">
            Calculated BMI: <span className="font-semibold text-accent-yellow">{livePreviewBmi}</span> (
            {bmiCategory(livePreviewBmi)})
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-4 rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Add Weight Entry'}
        </button>
      </motion.form>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Weight Progress</h3>
          {logs.length ? <Line data={weightChartData} options={chartOptions} /> : <EmptyState title="No data yet" />}
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">BMI Progress</h3>
          {logs.length ? <Line data={bmiChartData} options={chartOptions} /> : <EmptyState title="No data yet" />}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Weight & BMI History</h3>
        {logs.length === 0 ? (
          <EmptyState title="No entries yet" message="Add your first weight entry above to start tracking." />
        ) : (
          <DataTable
            columns={historyColumns}
            rows={[...logs].reverse().filter((l) => (l.notes || '').toLowerCase().includes(historySearch.toLowerCase()))}
            loading={false}
            search={historySearch}
            onSearchChange={setHistorySearch}
            page={1}
            pages={1}
            onPageChange={() => {}}
            emptyMessage="No entries yet"
          />
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Goal Tracker</h3>
            <p className="mt-1 text-sm text-gray-400">Set a target weight and track your journey.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={openGoalModal}
              className="rounded-full bg-accent-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
            >
              {goal ? 'Edit Goal' : 'Set Goal'}
            </button>
            {goal && (
              <button
                type="button"
                onClick={handleCancelGoal}
                disabled={cancellingGoal}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white disabled:opacity-60"
              >
                {cancellingGoal ? 'Removing...' : 'Cancel Goal'}
              </button>
            )}
          </div>
        </div>

        {goal && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-gray-500">Target</p>
              <p className="mt-1 font-medium text-white">{goal.targetWeight} kg</p>
            </div>
            <div>
              <p className="text-gray-500">Current</p>
              <p className="mt-1 font-medium text-white">{goal.currentWeight} kg</p>
            </div>
            <div>
              <p className="text-gray-500">Remaining</p>
              <p className="mt-1 font-medium text-white">{goal.remaining} kg</p>
            </div>
            <div>
              <p className="text-gray-500">Target Date</p>
              <p className="mt-1 font-medium text-white">{new Date(goal.targetDate).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Workout Frequency</h3>
          {workoutHistory.length ? <Bar data={frequencyChartData} options={chartOptions} /> : <EmptyState title="No workouts logged yet" />}
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Recent Workout History</h3>
          <DataTable
            columns={workoutColumns}
            rows={workoutHistory.slice(0, 10)}
            loading={false}
            search=""
            onSearchChange={() => {}}
            page={1}
            pages={1}
            onPageChange={() => {}}
            emptyMessage="No workout history yet"
          />
        </div>
      </div>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Weight Entry">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <input
            name="weight"
            type="number"
            step="0.1"
            value={editForm.weight}
            onChange={handleEditChange}
            required
            placeholder="Weight (kg)"
            className={inputClass}
          />
          <input
            name="height"
            type="number"
            step="0.1"
            value={editForm.height}
            onChange={handleEditChange}
            placeholder="Height (cm)"
            className={inputClass}
          />
          <input
            name="bodyFat"
            type="number"
            step="0.1"
            value={editForm.bodyFat}
            onChange={handleEditChange}
            placeholder="Body Fat %"
            className={inputClass}
          />
          <input name="notes" value={editForm.notes} onChange={handleEditChange} placeholder="Notes" className={inputClass} />
          <button
            type="submit"
            disabled={editSaving}
            className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {editSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message="Delete this weight entry? This cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />

      <Modal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} title={goal ? 'Edit Goal' : 'Set a Goal'}>
        <form onSubmit={handleGoalSubmit} className="space-y-4">
          <input
            name="goal"
            value={goalForm.goal}
            onChange={handleGoalChange}
            required
            placeholder="Goal (e.g. Lose 5kg for summer)"
            className={inputClass}
          />
          <input
            name="targetWeight"
            type="number"
            step="0.1"
            value={goalForm.targetWeight}
            onChange={handleGoalChange}
            required
            placeholder="Target weight (kg)"
            className={inputClass}
          />
          <input
            name="targetDate"
            type="date"
            value={goalForm.targetDate}
            onChange={handleGoalChange}
            required
            className={inputClass}
          />
          <button
            type="submit"
            disabled={goalSaving}
            className="w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {goalSaving ? 'Saving...' : 'Save Goal'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default Progress
