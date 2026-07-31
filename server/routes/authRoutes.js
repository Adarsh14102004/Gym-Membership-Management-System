const express = require('express')
const rateLimit = require('express-rate-limit')
const { register, login, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.get('/me', protect, getMe)

module.exports = router
