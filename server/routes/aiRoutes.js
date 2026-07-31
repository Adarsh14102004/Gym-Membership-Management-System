const express = require('express')
const rateLimit = require('express-rate-limit')
const { protect, authorize } = require('../middleware/authMiddleware')
const {
  getWorkoutRecommendation,
  getDietRecommendation,
  getBmiAnalysis,
  getProgressPrediction,
  chat,
  getHistory,
} = require('../controllers/aiController')
const { ruleBasedChat } = require('../controllers/chatbotController')

const router = express.Router()

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many AI requests. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.use(protect, authorize('member'))

router.post('/rule-chat', ruleBasedChat)

router.use(aiLimiter)

router.post('/workout-recommendation', getWorkoutRecommendation)
router.post('/diet-recommendation', getDietRecommendation)
router.post('/bmi-analysis', getBmiAnalysis)
router.post('/progress-prediction', getProgressPrediction)
router.post('/chat', chat)
router.get('/history', getHistory)

module.exports = router
