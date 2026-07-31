const MembershipPlan = require('../models/MembershipPlan')

const listPlans = async (req, res, next) => {
  try {
    const { search = '' } = req.query
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}
    const plans = await MembershipPlan.find(query).sort({ price: 1 })
    res.json(plans)
  } catch (error) {
    next(error)
  }
}

const createPlan = async (req, res, next) => {
  try {
    const { name, price, duration, features, popular, status } = req.body

    if (!name || price === undefined) {
      res.status(400)
      throw new Error('Name and price are required')
    }

    const plan = await MembershipPlan.create({ name, price, duration, features, popular, status })
    res.status(201).json(plan)
  } catch (error) {
    next(error)
  }
}

const updatePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id)
    if (!plan) {
      res.status(404)
      throw new Error('Plan not found')
    }

    const { name, price, duration, features, popular, status } = req.body
    if (name) plan.name = name
    if (price !== undefined) plan.price = price
    if (duration) plan.duration = duration
    if (features !== undefined) plan.features = features
    if (popular !== undefined) plan.popular = popular
    if (status) plan.status = status

    await plan.save()
    res.json(plan)
  } catch (error) {
    next(error)
  }
}

const deletePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndDelete(req.params.id)
    if (!plan) {
      res.status(404)
      throw new Error('Plan not found')
    }
    res.json({ message: 'Plan deleted' })
  } catch (error) {
    next(error)
  }
}

const listActivePlans = async (req, res, next) => {
  try {
    const plans = await MembershipPlan.find({ status: 'active' }).sort({ price: 1 })
    res.json(plans)
  } catch (error) {
    next(error)
  }
}

module.exports = { listPlans, createPlan, updatePlan, deletePlan, listActivePlans }
