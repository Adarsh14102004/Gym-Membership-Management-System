const jwt = require('jsonwebtoken')
const User = require('../models/User')

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

module.exports = { register, login, getMe }
