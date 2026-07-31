const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const {
  getMembershipAnalytics,
  getRevenueAnalytics,
  getClassAnalytics,
  getAttendanceAnalytics,
  getOverview,
} = require('../controllers/analyticsController')

const router = express.Router()

router.use(protect, authorize('admin'))

router.get('/overview', getOverview)
router.get('/membership', getMembershipAnalytics)
router.get('/revenue', getRevenueAnalytics)
router.get('/classes', getClassAnalytics)
router.get('/attendance', getAttendanceAnalytics)

module.exports = router
