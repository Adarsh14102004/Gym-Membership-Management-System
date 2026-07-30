const Goal = require('../models/Goal')
const ProgressLog = require('../models/ProgressLog')

const getLatestWeight = async (memberId, fallback) => {
  const latest = await ProgressLog.findOne({ member: memberId }).sort({ createdAt: -1 })
  return latest?.weight ?? fallback
}

const withProgress = async (goalDoc) => {
  const goal = goalDoc.toObject ? goalDoc.toObject() : goalDoc
  const currentWeight = await getLatestWeight(goal.member, goal.startWeight)
  const span = goal.targetWeight - goal.startWeight
  let percent = span === 0 ? 100 : ((currentWeight - goal.startWeight) / span) * 100
  percent = Math.max(0, Math.min(100, Math.round(percent)))
  const remaining = Number(Math.abs(goal.targetWeight - currentWeight).toFixed(1))

  return { ...goal, currentWeight, progress: percent, remaining }
}

const createGoal = async (req, res, next) => {
  try {
    const { goal, targetWeight, targetDate } = req.body
    if (!goal || !targetWeight || !targetDate) {
      res.status(400)
      throw new Error('Goal, target weight and target date are required')
    }

    const existing = await Goal.findOne({ member: req.user._id, status: 'active' })
    if (existing) {
      res.status(400)
      throw new Error('You already have an active goal. Update or cancel it first.')
    }

    const startWeight = await getLatestWeight(req.user._id, Number(targetWeight))

    const doc = await Goal.create({
      member: req.user._id,
      goal,
      startWeight,
      targetWeight: Number(targetWeight),
      targetDate,
    })

    res.status(201).json(await withProgress(doc))
  } catch (error) {
    next(error)
  }
}

const updateGoal = async (req, res, next) => {
  try {
    const doc = await Goal.findOne({ _id: req.params.id, member: req.user._id })
    if (!doc) {
      res.status(404)
      throw new Error('Goal not found')
    }

    const { goal, targetWeight, targetDate, status } = req.body
    if (goal) doc.goal = goal
    if (targetWeight !== undefined) doc.targetWeight = Number(targetWeight)
    if (targetDate) doc.targetDate = targetDate
    if (status) doc.status = status

    await doc.save()
    res.json(await withProgress(doc))
  } catch (error) {
    next(error)
  }
}

const deleteGoal = async (req, res, next) => {
  try {
    const doc = await Goal.findOneAndDelete({ _id: req.params.id, member: req.user._id })
    if (!doc) {
      res.status(404)
      throw new Error('Goal not found')
    }
    res.json({ message: 'Goal deleted' })
  } catch (error) {
    next(error)
  }
}

const getMyGoal = async (req, res, next) => {
  try {
    const doc = await Goal.findOne({ member: req.user._id, status: 'active' }).sort({ createdAt: -1 })
    if (!doc) {
      return res.json(null)
    }

    const result = await withProgress(doc)
    if (result.progress >= 100) {
      doc.status = 'achieved'
      await doc.save()
      result.status = 'achieved'
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = { createGoal, updateGoal, deleteGoal, getMyGoal }
