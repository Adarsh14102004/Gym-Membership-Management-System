const User = require('../models/User')
const Membership = require('../models/Membership')
const Payment = require('../models/Payment')
const Class = require('../models/Class')
const Booking = require('../models/Booking')
const Attendance = require('../models/Attendance')

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const lastNMonths = (n) => {
  const months = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(monthKey(d))
  }
  return months
}

const membershipAnalytics = async () => {
  await Membership.updateMany({ status: 'active', endDate: { $lt: new Date() } }, { status: 'expired' })

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [totalMembers, activeMemberships, expiredMemberships, newRegistrations, growthRaw] = await Promise.all([
    User.countDocuments({ role: 'member' }),
    Membership.countDocuments({ status: 'active', endDate: { $gte: new Date() } }),
    Membership.countDocuments({ status: 'expired' }),
    User.countDocuments({ role: 'member', createdAt: { $gte: startOfMonth } }),
    User.aggregate([
      { $match: { role: 'member', createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
  ])

  const months = lastNMonths(6)
  const growthMap = Object.fromEntries(growthRaw.map((g) => [g._id, g.count]))
  const membershipGrowth = months.map((m) => ({ month: m, count: growthMap[m] || 0 }))

  return { totalMembers, activeMembers: activeMemberships, expiredMemberships, newRegistrations, membershipGrowth }
}

const revenueAnalytics = async () => {
  const months = lastNMonths(6)

  const [totalRevenueAgg, monthlyRaw, recentPayments] = await Promise.all([
    Payment.aggregate([{ $match: { paymentStatus: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: { paymentStatus: 'success', paymentDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5, 1)) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } }, total: { $sum: '$amount' } } },
    ]),
    Payment.find({ paymentStatus: 'success' })
      .populate('member', 'name email')
      .populate('plan', 'name')
      .sort({ paymentDate: -1 })
      .limit(10),
  ])

  const monthlyMap = Object.fromEntries(monthlyRaw.map((m) => [m._id, m.total]))
  const monthlyRevenue = months.map((m) => ({ month: m, total: monthlyMap[m] || 0 }))

  return {
    totalRevenue: totalRevenueAgg[0]?.total || 0,
    monthlyRevenue,
    recentPayments,
  }
}

const classAnalytics = async () => {
  const [popularClasses, bookingCount, trainerPerfRaw] = await Promise.all([
    Class.find().populate('trainer', 'name').sort({ bookedSeats: -1 }).limit(5),
    Booking.countDocuments({ status: 'booked' }),
    Class.aggregate([
      { $group: { _id: '$trainer', classCount: { $sum: 1 }, totalBookings: { $sum: '$bookedSeats' }, totalCapacity: { $sum: '$capacity' } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 8 },
    ]),
  ])

  const trainerIds = trainerPerfRaw.map((t) => t._id)
  const trainers = await User.find({ _id: { $in: trainerIds } }).select('name')
  const trainerNameMap = Object.fromEntries(trainers.map((t) => [t._id.toString(), t.name]))

  const trainerPerformance = trainerPerfRaw.map((t) => ({
    trainer: trainerNameMap[t._id?.toString()] || 'Unknown',
    classCount: t.classCount,
    totalBookings: t.totalBookings,
    fillRate: t.totalCapacity ? Math.round((t.totalBookings / t.totalCapacity) * 100) : 0,
  }))

  const attendanceRate = popularClasses.length
    ? Math.round(
        (popularClasses.reduce((sum, c) => sum + (c.capacity ? c.bookedSeats / c.capacity : 0), 0) / popularClasses.length) * 100
      )
    : 0

  return {
    popularClasses: popularClasses.map((c) => ({
      title: c.title,
      category: c.category,
      trainer: c.trainer?.name || 'Unknown',
      bookedSeats: c.bookedSeats,
      capacity: c.capacity,
    })),
    bookingCount,
    classAttendanceRate: attendanceRate,
    trainerPerformance,
  }
}

const attendanceAnalytics = async () => {
  const last14 = new Date()
  last14.setDate(last14.getDate() - 13)
  const last14Key = last14.toISOString().slice(0, 10)

  const [dailyRaw, monthlyRaw, activeMembers, todayCount, peakHoursRaw] = await Promise.all([
    Attendance.aggregate([{ $match: { date: { $gte: last14Key } } }, { $group: { _id: '$date', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Attendance.aggregate([
      { $match: { date: { $gte: `${lastNMonths(6)[0]}-01` } } },
      { $group: { _id: { $substr: ['$date', 0, 7] }, count: { $sum: 1 } } },
    ]),
    Membership.countDocuments({ status: 'active', endDate: { $gte: new Date() } }),
    Attendance.countDocuments({ date: new Date().toISOString().slice(0, 10) }),
    Attendance.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ])

  const months = lastNMonths(6)
  const monthlyMap = Object.fromEntries(monthlyRaw.map((m) => [m._id, m.count]))
  const monthlyAttendance = months.map((m) => ({ month: m, count: monthlyMap[m] || 0 }))

  const attendancePercentage = activeMembers ? Math.round((todayCount / activeMembers) * 100) : 0

  const peakHoursMap = Object.fromEntries(peakHoursRaw.map((h) => [h._id, h.count]))
  const peakGymHours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: peakHoursMap[hour] || 0 }))

  return {
    dailyAttendance: dailyRaw.map((d) => ({ date: d._id, count: d.count })),
    monthlyAttendance,
    attendancePercentage,
    peakGymHours,
  }
}

module.exports = { membershipAnalytics, revenueAnalytics, classAnalytics, attendanceAnalytics }
