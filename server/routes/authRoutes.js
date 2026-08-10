const express = require('express')
const rateLimit = require('express-rate-limit')
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const { validate, registerRules, loginRules, forgotPasswordRules, resetPasswordRules } = require('../middleware/validateMiddleware')

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/register', authLimiter, validate(registerRules), register)
router.post('/login', authLimiter, validate(loginRules), login)
router.get('/me', protect, getMe)
router.post('/forgot-password', authLimiter, validate(forgotPasswordRules), forgotPassword)
router.put('/reset-password/:token', authLimiter, validate(resetPasswordRules), resetPassword)

module.exports = router
