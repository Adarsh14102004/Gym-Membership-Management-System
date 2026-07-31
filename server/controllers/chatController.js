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

const createChatMessage = async (senderId, recipientId, text) => {
  if (!text || !text.trim()) {
    throw new Error('Message text is required')
  }

  const [sender, recipient] = await Promise.all([User.findById(senderId), User.findById(recipientId)])
  if (!sender || !recipient) {
    throw new Error('User not found')
  }
  if (!isValidPair(sender, recipient)) {
    throw new Error('You are not authorized to message this user')
  }

  return Message.create({ sender: sender._id, recipient: recipient._id, text: text.trim() })
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
    const message = await createChatMessage(req.user._id, req.params.userId, req.body.text)
    res.status(201).json(message)
  } catch (error) {
    if (error.message === 'User not found') res.status(404)
    else if (error.message.includes('not authorized')) res.status(403)
    else res.status(400)
    next(error)
  }
}

const markRead = async (req, res, next) => {
  try {
    const other = await User.findById(req.params.userId)
    if (!other) {
      res.status(404)
      throw new Error('User not found')
    }
    if (!isValidPair(req.user, other)) {
      res.status(403)
      throw new Error('You are not authorized to access this conversation')
    }

    await Message.updateMany({ sender: other._id, recipient: req.user._id, read: false }, { read: true })

    const { notifyRead } = require('../socket')
    notifyRead(String(req.user._id), String(other._id))

    res.json({ message: 'Messages marked as read' })
  } catch (error) {
    next(error)
  }
}

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ recipient: req.user._id, read: false })
    res.json({ count })
  } catch (error) {
    next(error)
  }
}

module.exports = { getMessages, sendMessage, markRead, getUnreadCount, createChatMessage }
