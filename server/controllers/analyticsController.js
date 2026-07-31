const analyticsService = require('../services/analyticsService')

const getMembershipAnalytics = async (req, res, next) => {
  try {
    res.json(await analyticsService.membershipAnalytics())
  } catch (error) {
    next(error)
  }
}

const getRevenueAnalytics = async (req, res, next) => {
  try {
    res.json(await analyticsService.revenueAnalytics())
  } catch (error) {
    next(error)
  }
}

const getClassAnalytics = async (req, res, next) => {
  try {
    res.json(await analyticsService.classAnalytics())
  } catch (error) {
    next(error)
  }
}

const getAttendanceAnalytics = async (req, res, next) => {
  try {
    res.json(await analyticsService.attendanceAnalytics())
  } catch (error) {
    next(error)
  }
}

const getOverview = async (req, res, next) => {
  try {
    const [membership, revenue, classes, attendance] = await Promise.all([
      analyticsService.membershipAnalytics(),
      analyticsService.revenueAnalytics(),
      analyticsService.classAnalytics(),
      analyticsService.attendanceAnalytics(),
    ])
    res.json({ membership, revenue, classes, attendance })
  } catch (error) {
    next(error)
  }
}

module.exports = { getMembershipAnalytics, getRevenueAnalytics, getClassAnalytics, getAttendanceAnalytics, getOverview }
