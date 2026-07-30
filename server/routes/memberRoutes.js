const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const {
  getProfile,
  updateProfile,
  changePassword,
  getDietPlan,
  getDashboardSummary,
} = require('../controllers/memberDashboardController')
const { getMyMembership } = require('../controllers/membershipController')
const {
  getMyWeeklySchedule,
  getTodayWorkoutStatus,
  markWorkoutComplete,
  getMyWorkoutHistory,
} = require('../controllers/workoutHistoryController')
const {
  getAttendanceHistory,
  getTodayAttendance,
  getMyMonthlyAttendance,
  getMyQrCode,
  checkIn,
} = require('../controllers/attendanceController')
const { getNotifications, markNotificationRead } = require('../controllers/notificationController')
const { createGoal, updateGoal, deleteGoal, getMyGoal } = require('../controllers/goalController')

const router = express.Router()

router.use(protect, authorize('member'))

router.get('/dashboard', getDashboardSummary)

router.route('/profile').get(getProfile).put(updateProfile)
router.put('/change-password', changePassword)

router.get('/membership', getMyMembership)

router.get('/workout-plan', getMyWeeklySchedule)
router.get('/workout-plan/today', getTodayWorkoutStatus)
router.post('/workout-plan/complete', markWorkoutComplete)
router.get('/workout-history', getMyWorkoutHistory)
router.get('/diet-plan', getDietPlan)

router.get('/attendance', getAttendanceHistory)
router.get('/attendance/today', getTodayAttendance)
router.get('/attendance/monthly', getMyMonthlyAttendance)
router.get('/attendance/qr', getMyQrCode)
router.post('/attendance/checkin', checkIn)

router.get('/notifications', getNotifications)
router.put('/notifications/:id/read', markNotificationRead)

router.route('/goal').get(getMyGoal).post(createGoal)
router.route('/goal/:id').put(updateGoal).delete(deleteGoal)

module.exports = router
