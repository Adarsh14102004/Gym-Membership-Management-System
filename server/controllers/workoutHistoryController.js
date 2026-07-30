const WorkoutPlan = require('../models/WorkoutPlan')
const WorkoutHistory = require('../models/WorkoutHistory')

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const todayName = () => DAYS[new Date().getDay()]
const CALORIES_PER_MINUTE = 7

const startOfToday = () => new Date(new Date().toDateString())
const endOfToday = () => {
  const d = startOfToday()
  d.setDate(d.getDate() + 1)
  return d
}

const getMyWeeklySchedule = async (req, res, next) => {
  try {
    const plans = await WorkoutPlan.find({ member: req.user._id, status: 'active' })
      .populate('trainer', 'name')
      .populate('exercises')
    res.json(plans)
  } catch (error) {
    next(error)
  }
}

const getTodayWorkoutStatus = async (req, res, next) => {
  try {
    const day = todayName()
    const plan = await WorkoutPlan.findOne({ member: req.user._id, day, status: 'active' })
      .populate('trainer', 'name')
      .populate('exercises')

    if (!plan) {
      return res.json({ day, plan: null, completed: false, history: null })
    }

    const history = await WorkoutHistory.findOne({
      member: req.user._id,
      workoutPlan: plan._id,
      completedAt: { $gte: startOfToday(), $lt: endOfToday() },
    })

    res.json({ day, plan, completed: !!history, history: history || null })
  } catch (error) {
    next(error)
  }
}

const markWorkoutComplete = async (req, res, next) => {
  try {
    const { workoutPlanId, completedExercises } = req.body
    if (!workoutPlanId) {
      res.status(400)
      throw new Error('Workout plan is required')
    }

    const plan = await WorkoutPlan.findOne({ _id: workoutPlanId, member: req.user._id })
    if (!plan) {
      res.status(404)
      throw new Error('Workout plan not found')
    }

    const existing = await WorkoutHistory.findOne({
      member: req.user._id,
      workoutPlan: plan._id,
      completedAt: { $gte: startOfToday(), $lt: endOfToday() },
    })
    if (existing) {
      res.status(400)
      throw new Error('You have already logged this workout today')
    }

    const completed =
      Array.isArray(completedExercises) && completedExercises.length ? completedExercises : plan.exercises
    const status = completed.length >= plan.exercises.length ? 'completed' : 'partial'
    const duration = plan.duration || completed.length * 5
    const caloriesBurned = Math.round(duration * CALORIES_PER_MINUTE)

    const record = await WorkoutHistory.create({
      member: req.user._id,
      workoutPlan: plan._id,
      completedExercises: completed,
      duration,
      caloriesBurned,
      status,
    })

    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
}

const getMyWorkoutHistory = async (req, res, next) => {
  try {
    const records = await WorkoutHistory.find({ member: req.user._id })
      .populate({ path: 'workoutPlan', select: 'title day' })
      .sort({ completedAt: -1 })
      .limit(60)
    res.json(records)
  } catch (error) {
    next(error)
  }
}

module.exports = { getMyWeeklySchedule, getTodayWorkoutStatus, markWorkoutComplete, getMyWorkoutHistory }
