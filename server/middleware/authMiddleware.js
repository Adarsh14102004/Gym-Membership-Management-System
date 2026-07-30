const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    const token = header && header.startsWith('Bearer') ? header.split(' ')[1] : null

    if (!token) {
      res.status(401)
      throw new Error('Not authorized, no token')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      res.status(401)
      throw new Error('Not authorized, user not found')
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401)
    next(new Error('Not authorized, token failed'))
  }
}

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403)
    return next(new Error(`Role '${req.user?.role}' is not permitted to access this resource`))
  }
  next()
}

module.exports = { protect, authorize }
