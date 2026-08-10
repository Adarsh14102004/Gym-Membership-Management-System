const express = require('express')
const rateLimit = require('express-rate-limit')
const { submitContact } = require('../controllers/contactController')
const { validate, contactRules } = require('../middleware/validateMiddleware')

const router = express.Router()

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many messages sent. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/', contactLimiter, validate(contactRules), submitContact)

module.exports = router
