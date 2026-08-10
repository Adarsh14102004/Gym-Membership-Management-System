const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const { sendTemplatedEmail } = require('../services/emailService')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' })

const sendAuthResponse = (res, statusCode, user) => {
  res.status(statusCode).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  })
}

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400)
      throw new Error('Please provide name, email and password')
    }
    if (password.length < 6) {
      res.status(400)
      throw new Error('Password must be at least 6 characters')
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      res.status(400)
      throw new Error('User already exists with this email')
    }

    // Public self-registration always creates a member account. Trainer and
    // admin accounts are provisioned by an admin (see admin/trainer routes),
    // never chosen by the registering client.
    const user = await User.create({
      name,
      email,
      password,
      role: 'member',
    })

    sendAuthResponse(res, 201, user)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400)
      throw new Error('Please provide email and password')
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      res.status(401)
      throw new Error('Invalid email or password')
    }

    sendAuthResponse(res, 200, user)
  } catch (error) {
    next(error)
  }
}

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    })
  } catch (error) {
    next(error)
  }
}

// Always responds with the same generic message whether or not the email
// exists, so the endpoint can't be used to enumerate registered accounts.
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) {
      res.status(400)
      throw new Error('Please provide an email address')
    }

    const genericResponse = {
      message: 'If an account exists for that email, a password reset link has been sent.',
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(200).json(genericResponse)
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000 // 30 minutes
    await user.save({ validateBeforeSave: false })

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const resetUrl = `${clientUrl.replace(/\/$/, '')}/reset-password/${rawToken}`

    const { sent } = await sendTemplatedEmail('passwordReset', user.email, {
      name: user.name,
      resetUrl,
    })

    if (!sent) {
      // Email delivery isn't configured/failed — don't fail the request (would
      // leak account existence); the reset token still exists for support use.
      console.warn(`Password reset email not sent for ${user.email}`)
    }

    res.status(200).json(genericResponse)
  } catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params
    const { password } = req.body

    if (!password || password.length < 6) {
      res.status(400)
      throw new Error('Password must be at least 6 characters')
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire')

    if (!user) {
      res.status(400)
      throw new Error('Password reset link is invalid or has expired')
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    sendAuthResponse(res, 200, user)
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, getMe, forgotPassword, resetPassword }
