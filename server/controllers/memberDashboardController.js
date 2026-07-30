const User = require('../models/User')
const WorkoutPlan = require('../models/WorkoutPlan')
const DietPlan = require('../models/DietPlan')
const Notification = require('../models/Notification')
const Attendance = require('../models/Attendance')
const { getMembershipSummary } = require('./membershipController')

const todayKey = () => new Date().toISOString().slice(0, 10)
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const todayDayName = () => DAYS[new Date().getDay()]

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  height: user.height,
  profilePicture: user.profilePicture,
  notifyByEmail: user.notifyByEmail,
})

const getProfile = async (req, res, next) => {
  try {
    res.json(safeUser(req.user))
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, height, profilePicture, notifyByEmail } = req.body
    const member = await User.findById(req.user._id)

    if (name) member.name = name
    if (phone !== undefined) member.phone = phone
    if (address !== undefined) member.address = address
    if (height !== undefined) member.height = height
    if (profilePicture !== undefined) member.profilePicture = profilePicture
    if (notifyByEmail !== undefined) member.notifyByEmail = notifyByEmail

    await member.save()
    res.json(safeUser(member))
  } catch (error) {
    next(error)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      res.status(400)
      throw new Error('Current and new password are required')
    }
    if (newPassword.length < 6) {
      res.status(400)
      throw new Error('New password must be at least 6 characters')
    }

    const member = await User.findById(req.user._id).select('+password')
    if (!(await member.matchPassword(currentPassword))) {
      res.status(401)
      throw new Error('Current password is incorrect')
    }

    member.password = newPassword
    await member.save()
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    next(error)
  }
}

const getDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOne({ member: req.user._id, status: 'active' })
      .sort({ createdAt: -1 })
      .populate('trainer', 'name')
    res.json(plan)
  } catch (error) {
    next(error)
  }
}

const getDashboardSummary = async (req, res, next) => {
  try {
    const [membership, workoutPlan, dietPlan, unreadNotifications, todayAttendance] = await Promise.all([
      getMembershipSummary(req.user._id),
      WorkoutPlan.findOne({ member: req.user._id, day: todayDayName(), status: 'active' }),
      DietPlan.findOne({ member: req.user._id, status: 'active' }).sort({ createdAt: -1 }),
      Notification.countDocuments({ user: req.user._id, read: false }),
      Attendance.findOne({ member: req.user._id, date: todayKey() }),
    ])

    res.json({
      membership,
      todayWorkout: workoutPlan,
      todayDiet: dietPlan,
      attendanceToday: !!todayAttendance,
      unreadNotifications,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getDietPlan,
  getDashboardSummary,
}
