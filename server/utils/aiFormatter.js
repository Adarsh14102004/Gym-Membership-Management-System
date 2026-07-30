const asArray = (v) => (Array.isArray(v) ? v : [])
const asString = (v, fallback = '') => (typeof v === 'string' ? v : fallback)
const asNumber = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback)

const formatWorkoutResponse = (raw = {}) => ({
  overview: asString(raw.overview),
  weeklySchedule: asArray(raw.weeklySchedule).map((d) => ({
    day: asString(d.day),
    focus: asString(d.focus),
    exercises: asArray(d.exercises),
  })),
  tips: asArray(raw.tips),
})

const formatDietResponse = (raw = {}) => ({
  overview: asString(raw.overview),
  dailyMealPlan: asArray(raw.dailyMealPlan).map((m) => ({
    meal: asString(m.meal),
    items: asArray(m.items),
    calories: asNumber(m.calories),
  })),
  totals: {
    calories: asNumber(raw.totals?.calories),
    protein: asNumber(raw.totals?.protein),
    carbs: asNumber(raw.totals?.carbs),
    fat: asNumber(raw.totals?.fat),
  },
  tips: asArray(raw.tips),
})

const formatBmiResponse = (raw = {}) => ({
  bmi: raw.bmi,
  category: asString(raw.category),
  explanation: asString(raw.explanation),
  suggestions: asArray(raw.suggestions),
})

const formatPredictionResponse = (raw = {}) => ({
  expectedProgress: asString(raw.expectedProgress),
  improvementSuggestions: asArray(raw.improvementSuggestions),
  futureGoalEstimate: asString(raw.futureGoalEstimate),
})

module.exports = { formatWorkoutResponse, formatDietResponse, formatBmiResponse, formatPredictionResponse }
