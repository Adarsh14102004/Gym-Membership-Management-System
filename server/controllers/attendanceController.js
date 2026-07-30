const QRCode = require('qrcode')
const Attendance = require('../models/Attendance')
const Membership = require('../models/Membership')
const User = require('../models/User')

const todayKey = () => new Date().toISOString().slice(0, 10)
const monthPrefix = (key) => new RegExp(`^${key}`)

const isMembershipUsable = async (memberId) => {
  const membership = await Membership.findOne({ member: memberId }).sort({ endDate: -1 })
  if (!membership || membership.status === 'cancelled' || membership.status === 'pending') return false
  if (membership.endDate < new Date()) {
    if (membership.status === 'active') {
      membership.status = 'expired'
      await membership.save()
    }
    return false
  }
  return membership.status === 'active'
}

const getAttendanceHistory = async (req, res, next) => {
  try {
    const records = await Attendance.find({ member: req.user._id }).sort({ date: -1 }).limit(60)
    res.json(records)
  } catch (error) {
    next(error)
  }
}

const getTodayAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findOne({ member: req.user._id, date: todayKey() })
    res.json({ checkedIn: !!record, date: todayKey() })
  } catch (error) {
    next(error)
  }
}

const getMyMonthlyAttendance = async (req, res, next) => {
  try {
    const now = new Date()
    const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const records = await Attendance.find({ member: req.user._id, date: monthPrefix(month) }).sort({ date: 1 })
    res.json({ month, records, count: records.length })
  } catch (error) {
    next(error)
  }
}

const getMyQrCode = async (req, res, next) => {
  try {
    const value = req.user._id.toString()
    const image = await QRCode.toDataURL(value, { margin: 2, width: 220 })
    res.json({ value, image })
  } catch (error) {
    next(error)
  }
}

const checkIn = async (req, res, next) => {
  try {
    if (req.user.status !== 'active') {
      res.status(400)
      throw new Error('Your account is inactive. Contact the front desk.')
    }

    if (!(await isMembershipUsable(req.user._id))) {
      res.status(400)
      throw new Error('Your membership is expired or inactive. Renew to check in.')
    }

    const existing = await Attendance.findOne({ member: req.user._id, date: todayKey() })
    if (existing) {
      res.status(400)
      throw new Error('You have already checked in today')
    }

    const record = await Attendance.create({ member: req.user._id, date: todayKey() })
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
}

const markAttendanceByQr = async (req, res, next) => {
  try {
    const { qrValue } = req.body
    if (!qrValue) {
      res.status(400)
      throw new Error('QR value is required')
    }

    const member = await User.findOne({ _id: qrValue, role: 'member' }).catch(() => null)
    if (!member) {
      res.status(404)
      throw new Error('Member not found for this QR code')
    }

    if (member.status !== 'active') {
      res.status(400)
      throw new Error('Member account is inactive')
    }

    if (!(await isMembershipUsable(member._id))) {
      res.status(400)
      throw new Error('Membership expired or inactive - cannot check in')
    }

    const existing = await Attendance.findOne({ member: member._id, date: todayKey() })
    if (existing) {
      res.status(400)
      throw new Error(`${member.name} has already checked in today`)
    }

    const record = await Attendance.create({ member: member._id, date: todayKey() })
    res.status(201).json({ ...record.toObject(), memberName: member.name })
  } catch (error) {
    next(error)
  }
}

const getTodayAdminAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ date: todayKey() }).populate('member', 'name email').sort({ createdAt: -1 })
    res.json(records)
  } catch (error) {
    next(error)
  }
}

const getAllAttendance = async (req, res, next) => {
  try {
    const { search = '', date = '', month = '', page = 1, limit = 10 } = req.query
    const query = {}
    if (date) query.date = date
    else if (month) query.date = monthPrefix(month)

    let records = await Attendance.find(query).populate('member', 'name email').sort({ date: -1, createdAt: -1 })

    if (search) {
      const term = search.toLowerCase()
      records = records.filter(
        (r) => r.member?.name?.toLowerCase().includes(term) || r.member?.email?.toLowerCase().includes(term)
      )
    }

    const total = records.length
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Number(limit) || 10)
    const start = (pageNum - 1) * limitNum
    const data = records.slice(start, start + limitNum)

    res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 })
  } catch (error) {
    next(error)
  }
}

const getTrainerAttendance = async (req, res, next) => {
  try {
    const { date = '', month = '' } = req.query
    const members = await User.find({ assignedTrainer: req.user._id, role: 'member' }).select('_id')
    const memberIds = members.map((m) => m._id)

    const query = { member: { $in: memberIds } }
    if (date) query.date = date
    else if (month) query.date = monthPrefix(month)

    const records = await Attendance.find(query).populate('member', 'name email').sort({ date: -1 })
    res.json(records)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAttendanceHistory,
  getTodayAttendance,
  getMyMonthlyAttendance,
  getMyQrCode,
  checkIn,
  markAttendanceByQr,
  getTodayAdminAttendance,
  getAllAttendance,
  getTrainerAttendance,
}
