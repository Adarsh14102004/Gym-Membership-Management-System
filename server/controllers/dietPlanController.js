const DietPlan = require('../models/DietPlan')
const User = require('../models/User')
const Notification = require('../models/Notification')

const listDietPlans = async (req, res, next) => {
  try {
    const { member, search = '' } = req.query
    const query = { trainer: req.user._id }
    if (member) query.member = member
    if (search) query.title = { $regex: search, $options: 'i' }

    const plans = await DietPlan.find(query).populate('member', 'name email').sort({ createdAt: -1 })
    res.json(plans)
  } catch (error) {
    next(error)
  }
}

const createDietPlan = async (req, res, next) => {
  try {
    const { member, title, meals, notes, status } = req.body

    if (!member || !title) {
      res.status(400)
      throw new Error('Member and title are required')
    }

    const assignedMember = await User.findOne({ _id: member, role: 'member', assignedTrainer: req.user._id })
    if (!assignedMember) {
      res.status(400)
      throw new Error('Member is not assigned to you')
    }

    const plan = await DietPlan.create({
      member,
      trainer: req.user._id,
      title,
      meals,
      notes,
      status,
    })

    await Notification.create({
      user: member,
      title: 'New diet plan assigned',
      message: `Your trainer assigned a new diet plan: ${title}`,
      type: 'info',
    })

    res.status(201).json(plan)
  } catch (error) {
    next(error)
  }
}

const updateDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOne({ _id: req.params.id, trainer: req.user._id })
    if (!plan) {
      res.status(404)
      throw new Error('Diet plan not found')
    }

    const { title, meals, notes, status } = req.body
    if (title) plan.title = title
    if (meals !== undefined) plan.meals = meals
    if (notes !== undefined) plan.notes = notes
    if (status) plan.status = status

    await plan.save()
    res.json(plan)
  } catch (error) {
    next(error)
  }
}

const deleteDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOneAndDelete({ _id: req.params.id, trainer: req.user._id })
    if (!plan) {
      res.status(404)
      throw new Error('Diet plan not found')
    }
    res.json({ message: 'Diet plan deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = { listDietPlans, createDietPlan, updateDietPlan, deleteDietPlan }
