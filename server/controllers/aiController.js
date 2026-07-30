const aiService = require('../services/aiService')
const {
  formatWorkoutResponse,
  formatDietResponse,
  formatBmiResponse,
  formatPredictionResponse,
} = require('../utils/aiFormatter')
const AIHistory = require('../models/AIHistory')
const ProgressLog = require('../models/ProgressLog')
const WorkoutHistory = require('../models/WorkoutHistory')
const Goal = require('../models/Goal')

const WORKOUT_SCHEMA = {
  type: 'object',
  properties: {
    overview: { type: 'string' },
    weeklySchedule: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'string' },
          focus: { type: 'string' },
          exercises: { type: 'array', items: { type: 'string' } },
        },
        required: ['day', 'focus', 'exercises'],
        additionalProperties: false,
      },
    },
    tips: { type: 'array', items: { type: 'string' } },
  },
  required: ['overview', 'weeklySchedule', 'tips'],
  additionalProperties: false,
}

const DIET_SCHEMA = {
  type: 'object',
  properties: {
    overview: { type: 'string' },
    dailyMealPlan: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          meal: { type: 'string' },
          items: { type: 'array', items: { type: 'string' } },
          calories: { type: 'number' },
        },
        required: ['meal', 'items', 'calories'],
        additionalProperties: false,
      },
    },
    totals: {
      type: 'object',
      properties: {
        calories: { type: 'number' },
        protein: { type: 'number' },
        carbs: { type: 'number' },
        fat: { type: 'number' },
      },
      required: ['calories', 'protein', 'carbs', 'fat'],
      additionalProperties: false,
    },
    tips: { type: 'array', items: { type: 'string' } },
  },
  required: ['overview', 'dailyMealPlan', 'totals', 'tips'],
  additionalProperties: false,
}

const BMI_SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string' },
    explanation: { type: 'string' },
    suggestions: { type: 'array', items: { type: 'string' } },
  },
  required: ['category', 'explanation', 'suggestions'],
  additionalProperties: false,
}

const PREDICTION_SCHEMA = {
  type: 'object',
  properties: {
    expectedProgress: { type: 'string' },
    improvementSuggestions: { type: 'array', items: { type: 'string' } },
    futureGoalEstimate: { type: 'string' },
  },
  required: ['expectedProgress', 'improvementSuggestions', 'futureGoalEstimate'],
  additionalProperties: false,
}

const saveHistory = (user, type, input, response) => AIHistory.create({ user, type, input, response })

const handleAiError = (error, res, next) => {
  if (error.statusCode) res.status(error.statusCode)
  next(error)
}

const getWorkoutRecommendation = async (req, res, next) => {
  try {
    const { age, weight, height, fitnessGoal, experienceLevel, availableDays, bodyType } = req.body

    if (!age || !weight || !height || !fitnessGoal || !experienceLevel || !availableDays) {
      res.status(400)
      throw new Error('Age, weight, height, fitness goal, experience level and available days are required')
    }

    const prompt = `Create a personalized workout recommendation for a gym member with:
- Age: ${age}
- Weight: ${weight} kg
- Height: ${height} cm
- Fitness goal: ${fitnessGoal}
- Experience level: ${experienceLevel}
- Available workout days per week: ${availableDays}
- Body type: ${bodyType || 'not specified'}

Provide a weekly workout schedule (one entry per available day), specific exercise suggestions for each day, and general training tips.`

    const raw = await aiService.askJson({
      system: 'You are a certified fitness coach creating safe, practical workout plans for gym members.',
      prompt,
      schema: WORKOUT_SCHEMA,
    })
    const formatted = formatWorkoutResponse(raw)

    await saveHistory(req.user._id, 'workout', req.body, formatted)
    res.json(formatted)
  } catch (error) {
    handleAiError(error, res, next)
  }
}

const getDietRecommendation = async (req, res, next) => {
  try {
    const { bmi, weightGoal, foodPreference, caloriesTarget, activityLevel } = req.body

    if (!weightGoal || !foodPreference || !activityLevel) {
      res.status(400)
      throw new Error('Weight goal, food preference and activity level are required')
    }

    const prompt = `Create a personalized daily diet recommendation for a gym member with:
- BMI: ${bmi || 'not specified'}
- Weight goal: ${weightGoal}
- Food preference: ${foodPreference}
- Daily calorie target: ${caloriesTarget || 'recommend an appropriate target'}
- Activity level: ${activityLevel}

Provide a daily meal plan (breakfast, lunch, dinner, snacks), total daily calories/protein/carbs/fat, and nutrition tips.`

    const raw = await aiService.askJson({
      system: 'You are a certified nutrition coach creating safe, practical diet plans for gym members.',
      prompt,
      schema: DIET_SCHEMA,
    })
    const formatted = formatDietResponse(raw)

    await saveHistory(req.user._id, 'diet', req.body, formatted)
    res.json(formatted)
  } catch (error) {
    handleAiError(error, res, next)
  }
}

const getBmiAnalysis = async (req, res, next) => {
  try {
    const height = Number(req.body.height)
    const weight = Number(req.body.weight)

    if (!height || !weight) {
      res.status(400)
      throw new Error('Height and weight are required')
    }

    const bmi = Number((weight / (height / 100) ** 2).toFixed(1))
    const prompt = `A gym member has height ${height}cm, weight ${weight}kg, calculated BMI ${bmi}. Explain their BMI category, what it means for their health, and give practical improvement suggestions.`

    const raw = await aiService.askJson({
      system: 'You are a supportive fitness and wellness advisor. Avoid medical diagnoses and recommend a doctor for medical concerns.',
      prompt,
      schema: BMI_SCHEMA,
    })
    const formatted = formatBmiResponse({ ...raw, bmi })

    await saveHistory(req.user._id, 'bmi', { height, weight, bmi }, formatted)
    res.json(formatted)
  } catch (error) {
    handleAiError(error, res, next)
  }
}

const getProgressPrediction = async (req, res, next) => {
  try {
    const [logs, history, goal] = await Promise.all([
      ProgressLog.find({ member: req.user._id }).sort({ createdAt: -1 }).limit(10),
      WorkoutHistory.find({ member: req.user._id }).sort({ completedAt: -1 }).limit(20),
      Goal.findOne({ member: req.user._id, status: 'active' }),
    ])

    if (logs.length === 0) {
      res.status(400)
      throw new Error('Log at least one weight entry before requesting a prediction')
    }

    const weightSeries = [...logs]
      .reverse()
      .map((l) => `${new Date(l.createdAt).toLocaleDateString()}: ${l.weight}kg${l.bmi ? `, BMI ${l.bmi}` : ''}`)
      .join('; ')
    const completedCount = history.filter((h) => h.status === 'completed').length

    const prompt = `Analyze this member's fitness data and predict their progress:
Weight/BMI history (oldest to newest): ${weightSeries}
Workouts completed recently: ${completedCount} of ${history.length} logged
Active goal: ${goal ? `${goal.goal}, target ${goal.targetWeight}kg by ${new Date(goal.targetDate).toLocaleDateString()}` : 'none set'}

Predict their likely progress if current habits continue, suggest concrete improvements, and estimate a realistic future goal.`

    const raw = await aiService.askJson({
      system: 'You are a data-driven fitness analyst. Be encouraging but realistic, and never give medical advice.',
      prompt,
      schema: PREDICTION_SCHEMA,
    })
    const formatted = formatPredictionResponse(raw)

    await saveHistory(req.user._id, 'prediction', { weightSeries, completedCount, goal: goal?.goal || null }, formatted)
    res.json(formatted)
  } catch (error) {
    handleAiError(error, res, next)
  }
}

const chat = async (req, res, next) => {
  try {
    const { message } = req.body
    if (!message || !message.trim()) {
      res.status(400)
      throw new Error('Message is required')
    }

    const recent = await AIHistory.find({ user: req.user._id, type: 'chatbot' }).sort({ createdAt: -1 }).limit(6)
    const history = [...recent]
      .reverse()
      .flatMap((h) => [
        { role: 'user', content: h.input?.message || '' },
        { role: 'assistant', content: h.response?.reply || '' },
      ])
      .filter((m) => m.content)

    const reply = await aiService.askText({
      system:
        'You are a friendly, knowledgeable fitness assistant for a gym app. Help with fitness questions, workout guidance, diet suggestions, and motivation. Keep responses concise and practical. Do not give medical diagnoses - recommend consulting a professional for medical concerns.',
      messages: [...history, { role: 'user', content: message }],
    })

    await saveHistory(req.user._id, 'chatbot', { message }, { reply })
    res.json({ reply })
  } catch (error) {
    handleAiError(error, res, next)
  }
}

const getHistory = async (req, res, next) => {
  try {
    const { type = '' } = req.query
    const query = { user: req.user._id }
    if (type) query.type = type

    const records = await AIHistory.find(query).sort({ createdAt: -1 }).limit(50)
    res.json(records)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getWorkoutRecommendation,
  getDietRecommendation,
  getBmiAnalysis,
  getProgressPrediction,
  chat,
  getHistory,
}
