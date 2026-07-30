import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Loader from '../../components/Loader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import DataTable from '../../admin/components/DataTable.jsx'
import Modal from '../../admin/components/Modal.jsx'

const TABS = [
  { key: 'chat', label: 'Chat' },
  { key: 'workout', label: 'Workout' },
  { key: 'diet', label: 'Diet' },
  { key: 'bmi', label: 'BMI Analysis' },
  { key: 'prediction', label: 'Prediction' },
  { key: 'history', label: 'History' },
]

const inputClass =
  'w-full rounded-xl border border-white/10 bg-base px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-red'

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/10 bg-surface/60 p-6 backdrop-blur-sm ${className}`}>{children}</div>
)

const TipList = ({ items }) => (
  <ul className="mt-3 space-y-1.5">
    {items.map((t, i) => (
      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
        <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent-yellow" />
        {t}
      </li>
    ))}
  </ul>
)

const ChatPanel = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const { showToast } = useToast()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setSending(true)
    try {
      const { data } = await api.post('/ai/chat', { message: text })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (error) {
      showToast(error.response?.data?.message || 'Chat failed', 'error')
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I couldn't respond. Please try again." }])
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="flex h-[520px] flex-col p-4">
      <div className="flex-1 space-y-3 overflow-y-auto px-2 py-2">
        {messages.length === 0 && (
          <EmptyState title="Ask your AI Fitness Assistant" message="Ask about workouts, diet, or get some motivation." />
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user' ? 'bg-accent-red text-white' : 'bg-white/10 text-gray-200'
              }`}
            >
              {m.content}
            </div>
          </motion.div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-accent-yellow"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="mt-3 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a fitness question..."
          className={inputClass}
        />
        <button
          type="submit"
          disabled={sending}
          className="flex-none rounded-xl bg-accent-red px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </Card>
  )
}

const GOALS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'General Fitness']
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced']
const BODY_TYPES = ['Ectomorph', 'Mesomorph', 'Endomorph']

const WorkoutPanel = () => {
  const [form, setForm] = useState({
    age: '',
    weight: '',
    height: '',
    fitnessGoal: GOALS[0],
    experienceLevel: EXPERIENCE[0],
    availableDays: 3,
    bodyType: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { showToast } = useToast()

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/ai/workout-recommendation', {
        ...form,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        availableDays: Number(form.availableDays),
      })
      setResult(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to generate recommendation', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
          <input name="age" type="number" min="10" value={form.age} onChange={handleChange} required placeholder="Age" className={inputClass} />
          <input
            name="weight"
            type="number"
            min="1"
            value={form.weight}
            onChange={handleChange}
            required
            placeholder="Weight (kg)"
            className={inputClass}
          />
          <input
            name="height"
            type="number"
            min="1"
            value={form.height}
            onChange={handleChange}
            required
            placeholder="Height (cm)"
            className={inputClass}
          />
          <select name="fitnessGoal" value={form.fitnessGoal} onChange={handleChange} className={inputClass}>
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className={inputClass}>
            {EXPERIENCE.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input
            name="availableDays"
            type="number"
            min="1"
            max="7"
            value={form.availableDays}
            onChange={handleChange}
            required
            placeholder="Days per week"
            className={inputClass}
          />
          <select name="bodyType" value={form.bodyType} onChange={handleChange} className={inputClass}>
            <option value="">Body type (optional)</option>
            {BODY_TYPES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-3"
          >
            {loading ? 'Generating...' : 'Get Workout Recommendation'}
          </button>
        </form>
      </Card>

      {loading && <Loader />}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card>
            <h3 className="text-lg font-bold text-white">Overview</h3>
            <p className="mt-2 text-sm text-gray-400">{result.overview}</p>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.weeklySchedule.map((d, i) => (
              <Card key={i}>
                <span className="rounded-full bg-accent-yellow/15 px-3 py-1 text-xs font-semibold text-accent-yellow">{d.day}</span>
                <h4 className="mt-3 font-bold text-white">{d.focus}</h4>
                <ul className="mt-3 space-y-1.5">
                  {d.exercises.map((ex, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-red" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          <Card>
            <h3 className="text-lg font-bold text-white">Training Tips</h3>
            <TipList items={result.tips} />
          </Card>
        </motion.div>
      )}
    </div>
  )
}

const WEIGHT_GOALS = ['Lose Weight', 'Maintain Weight', 'Gain Weight']
const FOOD_PREFS = ['Balanced', 'Vegetarian', 'Vegan', 'Non-Vegetarian']
const ACTIVITY_LEVELS = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active']

const DietPanel = () => {
  const [form, setForm] = useState({
    bmi: '',
    weightGoal: WEIGHT_GOALS[0],
    foodPreference: FOOD_PREFS[0],
    caloriesTarget: '',
    activityLevel: ACTIVITY_LEVELS[2],
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    api
      .get('/progress/mine')
      .then(({ data }) => {
        const latest = data[data.length - 1]
        if (latest?.bmi) setForm((prev) => ({ ...prev, bmi: latest.bmi }))
      })
      .catch(() => {})
  }, [])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/ai/diet-recommendation', {
        ...form,
        bmi: form.bmi ? Number(form.bmi) : undefined,
        caloriesTarget: form.caloriesTarget ? Number(form.caloriesTarget) : undefined,
      })
      setResult(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to generate recommendation', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
          <input name="bmi" type="number" step="0.1" value={form.bmi} onChange={handleChange} placeholder="BMI (optional)" className={inputClass} />
          <select name="weightGoal" value={form.weightGoal} onChange={handleChange} className={inputClass}>
            {WEIGHT_GOALS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select name="foodPreference" value={form.foodPreference} onChange={handleChange} className={inputClass}>
            {FOOD_PREFS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input
            name="caloriesTarget"
            type="number"
            value={form.caloriesTarget}
            onChange={handleChange}
            placeholder="Calorie target (optional)"
            className={inputClass}
          />
          <select name="activityLevel" value={form.activityLevel} onChange={handleChange} className={inputClass}>
            {ACTIVITY_LEVELS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Get Diet Recommendation'}
          </button>
        </form>
      </Card>

      {loading && <Loader />}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card>
            <h3 className="text-lg font-bold text-white">Overview</h3>
            <p className="mt-2 text-sm text-gray-400">{result.overview}</p>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Calories', value: result.totals.calories },
              { label: 'Protein', value: `${result.totals.protein}g` },
              { label: 'Carbs', value: `${result.totals.carbs}g` },
              { label: 'Fat', value: `${result.totals.fat}g` },
            ].map((s) => (
              <Card key={s.label}>
                <p className="text-sm text-gray-400">{s.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-accent-yellow">{s.value}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {result.dailyMealPlan.map((m, i) => (
              <Card key={i}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">{m.meal}</h4>
                  <span className="text-xs text-gray-500">{m.calories} kcal</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {m.items.map((it, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-red" />
                      {it}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          <Card>
            <h3 className="text-lg font-bold text-white">Nutrition Tips</h3>
            <TipList items={result.tips} />
          </Card>
        </motion.div>
      )}
    </div>
  )
}

const categoryStyles = {
  Underweight: 'bg-white/10 text-gray-300',
  Normal: 'bg-accent-yellow/15 text-accent-yellow',
  Overweight: 'bg-accent-red/10 text-accent-red',
  Obese: 'bg-accent-red/15 text-accent-red',
}

const BmiPanel = () => {
  const [form, setForm] = useState({ height: '', weight: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { showToast } = useToast()

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/ai/bmi-analysis', { height: Number(form.height), weight: Number(form.weight) })
      setResult(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to analyze BMI', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
          <input name="height" type="number" value={form.height} onChange={handleChange} required placeholder="Height (cm)" className={inputClass} />
          <input name="weight" type="number" value={form.weight} onChange={handleChange} required placeholder="Weight (kg)" className={inputClass} />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-accent-red py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Analyzing...' : 'Analyze BMI'}
          </button>
        </form>
      </Card>

      {loading && <Loader />}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-xl">
            <p className="text-sm text-gray-400">Your BMI</p>
            <p className="mt-2 text-4xl font-extrabold text-white">{result.bmi}</p>
            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                categoryStyles[result.category] || 'bg-white/10 text-gray-300'
              }`}
            >
              {result.category}
            </span>
            <p className="mt-4 text-sm text-gray-400">{result.explanation}</p>
            <TipList items={result.suggestions} />
          </Card>
        </motion.div>
      )}
    </div>
  )
}

const PredictionPanel = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { showToast } = useToast()

  const handleGenerate = async () => {
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/ai/progress-prediction')
      setResult(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to generate prediction', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Progress Prediction</h3>
          <p className="mt-1 text-sm text-gray-400">Uses your weight history, BMI history, workout completion and goals.</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-full bg-accent-red px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105 disabled:opacity-60"
        >
          {loading ? 'Analyzing...' : 'Generate Prediction'}
        </button>
      </Card>

      {loading && <Loader />}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card>
            <h4 className="font-bold text-white">Expected Progress</h4>
            <p className="mt-2 text-sm text-gray-400">{result.expectedProgress}</p>
          </Card>
          <Card>
            <h4 className="font-bold text-white">Improvement Suggestions</h4>
            <TipList items={result.improvementSuggestions} />
          </Card>
          <Card>
            <h4 className="font-bold text-white">Future Goal Estimate</h4>
            <p className="mt-2 text-sm text-gray-400">{result.futureGoalEstimate}</p>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

const typeStyles = {
  workout: 'bg-accent-red/15 text-accent-red',
  diet: 'bg-accent-yellow/15 text-accent-yellow',
  chatbot: 'bg-white/10 text-gray-300',
  bmi: 'bg-accent-yellow/15 text-accent-yellow',
  prediction: 'bg-accent-red/15 text-accent-red',
}

const summaryFor = (row) => {
  if (row.type === 'chatbot') return row.input?.message || '—'
  if (row.type === 'bmi') return `BMI ${row.response?.bmi ?? '—'}`
  if (row.type === 'workout') return row.input?.fitnessGoal || '—'
  if (row.type === 'diet') return row.input?.weightGoal || '—'
  if (row.type === 'prediction') return 'Progress prediction'
  return '—'
}

const HistoryPanel = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [viewTarget, setViewTarget] = useState(null)
  const { showToast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/ai/history', { params: { type } })
      setRecords(data)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load history', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${typeStyles[row.type]}`}>{row.type}</span>
      ),
    },
    { key: 'summary', label: 'Summary', render: summaryFor },
    { key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleString() },
    {
      key: 'view',
      label: '',
      render: (row) => (
        <button type="button" onClick={() => setViewTarget(row)} className="font-medium text-accent-yellow hover:underline">
          View
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        rows={records.filter((r) => summaryFor(r).toLowerCase().includes(search.toLowerCase()))}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        filters={
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="">All Types</option>
            <option value="workout">Workout</option>
            <option value="diet">Diet</option>
            <option value="chatbot">Chatbot</option>
            <option value="bmi">BMI</option>
            <option value="prediction">Prediction</option>
          </select>
        }
        page={1}
        pages={1}
        onPageChange={() => {}}
        emptyMessage="No AI activity yet"
      />

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={viewTarget ? `${viewTarget.type} details` : ''}>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-base p-4 text-xs text-gray-300">
          {viewTarget ? JSON.stringify(viewTarget.response, null, 2) : ''}
        </pre>
      </Modal>
    </div>
  )
}

const AIAssistant = () => {
  const [tab, setTab] = useState('chat')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Fitness Assistant</h2>
        <p className="mt-1 text-sm text-gray-400">
          Personalized workout & diet recommendations, BMI analysis, progress predictions, and a fitness chatbot.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? 'bg-accent-red text-white' : 'bg-white/5 text-gray-300 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'chat' && <ChatPanel />}
          {tab === 'workout' && <WorkoutPanel />}
          {tab === 'diet' && <DietPanel />}
          {tab === 'bmi' && <BmiPanel />}
          {tab === 'prediction' && <PredictionPanel />}
          {tab === 'history' && <HistoryPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AIAssistant
