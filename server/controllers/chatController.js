const Message = require('../models/Message')
const User = require('../models/User')

const isValidPair = (requester, other) => {
  if (requester.role === 'trainer' && other.role === 'member') {
    return other.assignedTrainer && String(other.assignedTrainer) === String(requester._id)
  }
  if (requester.role === 'member' && other.role === 'trainer') {
    return requester.assignedTrainer && String(requester.assignedTrainer) === String(other._id)
  }
  return false
}

const getMessages = async (req, res, next) => {
  try {
    const other = await User.findById(req.params.userId)
    if (!other) {
      res.status(404)
      throw new Error('User not found')
    }
    if (!isValidPair(req.user, other)) {
      res.status(403)
      throw new Error('You are not authorized to view this conversation')
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: other._id },
        { sender: other._id, recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 })

    res.json(messages)
  } catch (error) {
    next(error)
  }
}

const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body
    if (!text) {
      res.status(400)
      throw new Error('Message text is required')
    }

    const other = await User.findById(req.params.userId)
    if (!other) {
      res.status(404)
      throw new Error('User not found')
    }
    if (!isValidPair(req.user, other)) {
      res.status(403)
      throw new Error('You are not authorized to message this user')
    }

    const message = await Message.create({ sender: req.user._id, recipient: other._id, text })
    res.status(201).json(message)
  } catch (error) {
    next(error)
  }
}

module.exports = { getMessages, sendMessage }
