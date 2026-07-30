import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import DataTable from '../../admin/components/DataTable.jsx'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const WorkoutPlan = () => {
  const [schedule, setSchedule] = useState([])
  const [today, setToday] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(DAYS[0])
  const [checked, setChecked] = useState([])
  const [completing, setCompleting] = useState(false)
  const [search, setSearch] = useState('')
  const { showToast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [scheduleRes, todayRes, historyRes] = await Promise.all([
        api.get('/member/workout-plan'),
        api.get('/member/workout-plan/today'),
        api.get('/member/workout-history'),
      ])
      setSchedule(scheduleRes.data)
      setToday(todayRes.data)
      setHistory(historyRes.data)
      setSelectedDay(todayRes.data.day)
      setChecked(todayRes.data.plan?.exercises?.map((e) => e._id) || [])
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load workout plan', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedPlan = useMemo(() => schedule.find((p) => p.day === selectedDay) || null, [schedule, selectedDay])
  const isToday = selectedDay === today?.day
  const isCompletedToday = isToday && today?.completed

  const toggleChecked = (id) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleComplete = async () => {
    if (!selectedPlan) return
    setCompleting(true)
    try {
      await api.post('/member/workout-plan/complete', { workoutPlanId: selectedPlan._id, completedExercises: checked })
      showToast('Workout marked complete!', 'success')
      load()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to mark complete', 'error')
    } finally {
      setCompleting(false)
    }
  }

  const columns = [
    { key: 'title', label: 'Plan', render: (row) => row.workoutPlan?.title || 'Deleted plan' },
    { key: 'day', label: 'Day', render: (row) => row.workoutPlan?.day || '—' },
    { key: 'completedAt', label: 'Completed', render: (row) => new Date(row.completedAt).toLocaleDateString() },
    { key: 'exercises', label: 'Exercises Done', render: (row) => row.completedExercises?.length || 0 },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            row.status === 'completed' ? 'bg-accent-yellow/15 text-accent-yellow' : 'bg-white/10 text-gray-400'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24" />
        <Skeleton className="h-56" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">My Workout Plan</h2>
        <p className="mt-1 text-sm text-gray-400">Your weekly training schedule from your coach.</p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {DAYS.map((day) => {
          const plan = schedule.find((p) => p.day === day)
          const active = day === selectedDay
          return (
            <motion.button
              key={day}
              type="button"
              whileHover={{ y: -3 }}
              onClick={() => setSelectedDay(day)}
              className={`rounded-2xl border p-3 text-center transition-colors ${
                active ? 'border-accent-red bg-accent-red/10' : 'border-white/10 bg-surface/60 hover:border-white/20'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{day.slice(0, 3)}</p>
              <p className={`mt-1 text-xs font-medium ${plan ? 'text-accent-yellow' : 'text-gray-600'}`}>
                {plan ? `${plan.exercises?.length || 0} ex.` : 'Rest'}
              </p>
              {day === today?.day && <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-accent-red mx-auto" />}
            </motion.button>
          )
        })}
      </div>

      {!selectedPlan ? (
        <EmptyState title="Rest day" message="No workout plan assigned for this day." />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-surface/60 p-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-accent-yellow/15 px-3 py-1 text-xs font-semibold text-accent-yellow">{selectedPlan.day}</span>
            {isCompletedToday && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300">Completed Today</span>
            )}
          </div>
          <h3 className="mt-4 text-2xl font-bold text-white">{selectedPlan.title}</h3>
          {selectedPlan.trainer?.name && <p className="mt-1 text-sm text-gray-400">Coach: {selectedPlan.trainer.name}</p>}
          {selectedPlan.duration && <p className="mt-1 text-sm text-gray-500">Session length: {selectedPlan.duration} min</p>}

          <ul className="mt-6 space-y-2">
            {selectedPlan.exercises?.map((exercise) => (
              <li
                key={exercise._id}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-base px-4 py-3 text-sm text-gray-300"
              >
                {isToday && !isCompletedToday ? (
                  <input
                    type="checkbox"
                    checked={checked.includes(exercise._id)}
                    onChange={() => toggleChecked(exercise._id)}
                    className="h-4 w-4 accent-accent-red"
                  />
                ) : (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isCompletedToday && today?.history?.completedExercises?.includes(exercise._id)
                        ? 'bg-accent-yellow'
                        : 'bg-accent-red'
                    }`}
                  />
                )}
                <div className="flex-1">
                  <span className="font-medium text-white">{exercise.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {exercise.sets || exercise.reps ? `${exercise.sets || 0}x${exercise.reps || 0}` : exercise.duration ? `${exercise.duration} min` : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {selectedPlan.notes && <p className="mt-6 text-sm text-gray-400">Notes: {selectedPlan.notes}</p>}

          {isToday && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={completing || isCompletedToday}
              className="mt-6 w-full rounded-xl bg-accent-red py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 sm:w-auto sm:px-8"
            >
              {isCompletedToday ? 'Workout Completed' : completing ? 'Saving...' : 'Mark Workout Complete'}
            </button>
          )}
        </motion.div>
      )}

      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Workout History</h3>
        <DataTable
          columns={columns}
          rows={history.filter((h) => h.workoutPlan?.title?.toLowerCase().includes(search.toLowerCase()))}
          loading={false}
          search={search}
          onSearchChange={setSearch}
          page={1}
          pages={1}
          onPageChange={() => {}}
          emptyMessage="No workout history yet"
        />
      </div>
    </div>
  )
}

export default WorkoutPlan
