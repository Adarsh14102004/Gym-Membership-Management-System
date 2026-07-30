const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const {
  getProfile,
  updateProfile,
  listMyMembers,
  listAvailableMembers,
  assignMember,
  unassignMember,
} = require('../controllers/trainerDashboardController')
const {
  listWorkoutPlans,
  getWorkoutPlan,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} = require('../controllers/workoutPlanController')
const { listExercises, getExercise, createExercise, updateExercise, deleteExercise } = require('../controllers/exerciseController')
const { listDietPlans, createDietPlan, updateDietPlan, deleteDietPlan } = require('../controllers/dietPlanController')
const { listVideos, createVideo, updateVideo, deleteVideo } = require('../controllers/videoController')
const { listProgress, reviewProgress } = require('../controllers/progressController')
const { getTrainerAttendance } = require('../controllers/attendanceController')

const router = express.Router()

router.use(protect, authorize('trainer'))

router.route('/profile').get(getProfile).put(updateProfile)

router.get('/members', listMyMembers)
router.get('/members/available', listAvailableMembers)
router.put('/members/:id/assign', assignMember)
router.put('/members/:id/unassign', unassignMember)

router.route('/exercises').get(listExercises).post(createExercise)
router.route('/exercises/:id').get(getExercise).put(updateExercise).delete(deleteExercise)

router.route('/workout-plans').get(listWorkoutPlans).post(createWorkoutPlan)
router.route('/workout-plans/:id').get(getWorkoutPlan).put(updateWorkoutPlan).delete(deleteWorkoutPlan)

router.route('/diet-plans').get(listDietPlans).post(createDietPlan)
router.route('/diet-plans/:id').put(updateDietPlan).delete(deleteDietPlan)

router.route('/videos').get(listVideos).post(createVideo)
router.route('/videos/:id').put(updateVideo).delete(deleteVideo)

router.get('/progress', listProgress)
router.put('/progress/:id/review', reviewProgress)

router.get('/attendance', getTrainerAttendance)

module.exports = router
