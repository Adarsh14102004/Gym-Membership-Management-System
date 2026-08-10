const { body, validationResult } = require('express-validator')

// Wraps an array of express-validator chains: runs them, then short-circuits
// with a 400 + field-level messages if any failed. Keeps controllers free of
// manual validation boilerplate.
const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) return next()

    res.status(400)
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ')
    next(new Error(message))
  },
]

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]

const forgotPasswordRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email').normalizeEmail(),
]

const resetPasswordRules = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 150 }),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
]

const razorpayOrderRules = [body('plan').notEmpty().withMessage('Plan is required').isMongoId().withMessage('Invalid plan id')]

module.exports = {
  validate,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  contactRules,
  razorpayOrderRules,
}
