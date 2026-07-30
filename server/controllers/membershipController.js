const Membership = require('../models/Membership')
const MembershipPlan = require('../models/MembershipPlan')
const User = require('../models/User')

const DURATION_MONTHS = { monthly: 1, quarterly: 3, yearly: 12 }

const addMonths = (date, months) => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

const autoExpire = () => Membership.updateMany({ status: 'active', endDate: { $lt: new Date() } }, { status: 'expired' })

const listMemberships = async (req, res, next) => {
  try {
    await autoExpire()
    const { search = '', status = '', page = 1, limit = 8 } = req.query

    const query = {}
    if (status) query.status = status
    if (search) {
      const members = await User.find({
        role: 'member',
        $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }],
      }).select('_id')
      query.member = { $in: members.map((m) => m._id) }
    }

    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Number(limit) || 8)
    const skip = (pageNum - 1) * limitNum

    const [data, total] = await Promise.all([
      Membership.find(query)
        .populate('member', 'name email')
        .populate('plan', 'name duration')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Membership.countDocuments(query),
    ])

    res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 })
  } catch (error) {
    next(error)
  }
}

const createMembership = async (req, res, next) => {
  try {
    const { member, plan, startDate, amount, status } = req.body
    if (!member || !plan) {
      res.status(400)
      throw new Error('Member and plan are required')
    }

    const memberUser = await User.findOne({ _id: member, role: 'member' })
    if (!memberUser) {
      res.status(400)
      throw new Error('Member not found')
    }

    const planDoc = await MembershipPlan.findById(plan)
    if (!planDoc) {
      res.status(400)
      throw new Error('Plan not found')
    }

    const start = startDate ? new Date(startDate) : new Date()
    const endDate = addMonths(start, DURATION_MONTHS[planDoc.duration] || 1)

    const membership = await Membership.create({
      member,
      plan,
      startDate: start,
      endDate,
      amount: amount !== undefined && amount !== '' ? Number(amount) : planDoc.price,
      status: status || 'active',
    })

    await membership.populate('member', 'name email')
    await membership.populate('plan', 'name duration')

    res.status(201).json(membership)
  } catch (error) {
    next(error)
  }
}

const updateMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id)
    if (!membership) {
      res.status(404)
      throw new Error('Membership not found')
    }

    const { plan, startDate, endDate, amount, status } = req.body

    if (plan) {
      const planDoc = await MembershipPlan.findById(plan)
      if (!planDoc) {
        res.status(400)
        throw new Error('Plan not found')
      }
      membership.plan = plan
      if (!endDate) {
        membership.endDate = addMonths(startDate || membership.startDate, DURATION_MONTHS[planDoc.duration] || 1)
      }
    }

    if (startDate) membership.startDate = startDate
    if (endDate) membership.endDate = endDate
    if (amount !== undefined && amount !== '') membership.amount = Number(amount)
    if (status) membership.status = status

    await membership.save()
    await membership.populate('member', 'name email')
    await membership.populate('plan', 'name duration')

    res.json(membership)
  } catch (error) {
    next(error)
  }
}

const deleteMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findByIdAndDelete(req.params.id)
    if (!membership) {
      res.status(404)
      throw new Error('Membership not found')
    }
    res.json({ message: 'Membership deleted' })
  } catch (error) {
    next(error)
  }
}

const renewMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id).populate('plan')
    if (!membership) {
      res.status(404)
      throw new Error('Membership not found')
    }

    const base = membership.endDate > new Date() ? membership.endDate : new Date()
    membership.startDate = new Date()
    membership.endDate = addMonths(base, DURATION_MONTHS[membership.plan.duration] || 1)
    membership.amount = membership.plan.price
    membership.status = 'active'

    await membership.save()
    await membership.populate('member', 'name email')

    res.json(membership)
  } catch (error) {
    next(error)
  }
}

const checkExpiry = async (req, res, next) => {
  try {
    const result = await autoExpire()
    res.json({ updated: result.modifiedCount })
  } catch (error) {
    next(error)
  }
}

const getMembershipSummary = async (memberId) => {
  await autoExpire()
  const membership = await Membership.findOne({ member: memberId }).sort({ endDate: -1 }).populate('plan')

  if (!membership) {
    return { planName: null, price: null, duration: null, startDate: null, expiryDate: null, daysRemaining: null, status: 'none' }
  }

  const daysRemaining = Math.ceil((membership.endDate - Date.now()) / (1000 * 60 * 60 * 24))

  return {
    planName: membership.plan?.name,
    price: membership.amount,
    duration: membership.plan?.duration,
    startDate: membership.startDate,
    expiryDate: membership.endDate,
    daysRemaining,
    status: membership.status,
  }
}

const getMyMembership = async (req, res, next) => {
  try {
    const summary = await getMembershipSummary(req.user._id)
    res.json(summary)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  listMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
  renewMembership,
  checkExpiry,
  getMembershipSummary,
  getMyMembership,
}
