const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const { getStats, getActivity } = require('../controllers/adminController')
const { listMembers, createMember, updateMember, deleteMember } = require('../controllers/memberController')
const { listTrainers, createTrainer, updateTrainer, deleteTrainer } = require('../controllers/trainerController')
const { listPlans, createPlan, updatePlan, deletePlan } = require('../controllers/planController')
const {
  listMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
  renewMembership,
  checkExpiry,
} = require('../controllers/membershipController')
const { markAttendanceByQr, getTodayAdminAttendance, getAllAttendance } = require('../controllers/attendanceController')

const router = express.Router()

router.use(protect, authorize('admin'))

router.get('/stats', getStats)
router.get('/activity', getActivity)

router.route('/members').get(listMembers).post(createMember)
router.route('/members/:id').put(updateMember).delete(deleteMember)

router.route('/trainers').get(listTrainers).post(createTrainer)
router.route('/trainers/:id').put(updateTrainer).delete(deleteTrainer)

router.route('/plans').get(listPlans).post(createPlan)
router.route('/plans/:id').put(updatePlan).delete(deletePlan)

router.route('/memberships').get(listMemberships).post(createMembership)
router.route('/memberships/:id').put(updateMembership).delete(deleteMembership)
router.put('/memberships/:id/renew', renewMembership)
router.get('/memberships/check-expiry', checkExpiry)

router.get('/attendance', getAllAttendance)
router.get('/attendance/today', getTodayAdminAttendance)
router.post('/attendance/scan', markAttendanceByQr)

module.exports = router
