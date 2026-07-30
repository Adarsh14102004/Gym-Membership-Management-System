const WorkoutPlan = require('../models/WorkoutPlan')
const User = require('../models/User')
const Notification = require('../models/Notification')

const listWorkoutPlans = async (req, res, next) => {
  try {
    const { member, day, search = '' } = req.query
    const query = { trainer: req.user._id }
    if (member) query.member = member
    if (day) query.day = day
    if (search) query.title = { $regex: search, $options: 'i' }

    const plans = await WorkoutPlan.find(query)
      .populate('member', 'name email')
      .populate('exercises', 'name category muscleGroup')
      .sort({ day: 1, createdAt: -1 })
    res.json(plans)
  } catch (error) {
    next(error)
  }
}

const getWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findOne({ _id: req.params.id, trainer: req.user._id })
      .populate('member', 'name email')
      .populate('exercises')
    if (!plan) {
      res.status(404)
      throw new Error('Workout plan not found')
    }
    res.json(plan)
  } catch (error) {
    next(error)
  }
}

const createWorkoutPlan = async (req, res, next) => {
  try {
    const { member, title, exercises, day, duration, notes, status } = req.body

    if (!member || !title || !day) {
      res.status(400)
      throw new Error('Member, title and day are required')
    }

    const assignedMember = await User.findOne({ _id: member, role: 'member', assignedTrainer: req.user._id })
    if (!assignedMember) {
      res.status(400)
      throw new Error('Member is not assigned to you')
    }

    const existing = await WorkoutPlan.findOne({ member, day, trainer: req.user._id, status: 'active' })
    if (existing) {
      res.status(400)
      throw new Error(`This member already has an active plan on ${day}. Edit it instead.`)
    }

    const plan = await WorkoutPlan.create({
      member,
      trainer: req.user._id,
      title,
      exercises,
      day,
      duration: duration || null,
      notes,
      status,
    })

    await Notification.create({
      user: member,
      title: 'New workout plan assigned',
      message: `Your trainer assigned a new ${day} workout plan: ${title}`,
      type: 'info',
    })

    await plan.populate('exercises', 'name category muscleGroup')

    res.status(201).json(plan)
  } catch (error) {
    next(error)
  }
}

const updateWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findOne({ _id: req.params.id, trainer: req.user._id })
    if (!plan) {
      res.status(404)
      throw new Error('Workout plan not found')
    }

    const { title, exercises, day, duration, notes, status } = req.body

    if (day && day !== plan.day) {
      const conflict = await WorkoutPlan.findOne({
        _id: { $ne: plan._id },
        member: plan.member,
        day,
        trainer: req.user._id,
        status: 'active',
      })
      if (conflict) {
        res.status(400)
        throw new Error(`This member already has an active plan on ${day}.`)
      }
      plan.day = day
    }

    if (title) plan.title = title
    if (exercises !== undefined) plan.exercises = exercises
    if (duration !== undefined) plan.duration = duration || null
    if (notes !== undefined) plan.notes = notes
    if (status) plan.status = status

    await plan.save()
    await plan.populate('exercises', 'name category muscleGroup')
    await plan.populate('member', 'name email')
    res.json(plan)
  } catch (error) {
    next(error)
  }
}

const deleteWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findOneAndDelete({ _id: req.params.id, trainer: req.user._id })
    if (!plan) {
      res.status(404)
      throw new Error('Workout plan not found')
    }
    res.json({ message: 'Workout plan deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = { listWorkoutPlans, getWorkoutPlan, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan }
