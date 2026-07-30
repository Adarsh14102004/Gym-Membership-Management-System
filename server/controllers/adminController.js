const User = require('../models/User')
const MembershipPlan = require('../models/MembershipPlan')

const getStats = async (req, res, next) => {
  try {
    const [totalMembers, activeMembers, totalTrainers, totalPlans] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ role: 'member', status: 'active' }),
      User.countDocuments({ role: 'trainer' }),
      MembershipPlan.countDocuments(),
    ])

    res.json({ totalMembers, activeMembers, totalTrainers, totalPlans })
  } catch (error) {
    next(error)
  }
}

const getActivity = async (req, res, next) => {
  try {
    const activity = await User.find({ role: { $in: ['member', 'trainer'] } })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('name role createdAt')

    res.json(activity)
  } catch (error) {
    next(error)
  }
}

module.exports = { getStats, getActivity }
