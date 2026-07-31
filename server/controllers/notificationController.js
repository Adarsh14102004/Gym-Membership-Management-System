const Notification = require('../models/Notification')
const User = require('../models/User')
const { sendTemplatedEmail } = require('../services/emailService')

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30)
    res.json(notifications)
  } catch (error) {
    next(error)
  }
}

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false })
    res.json({ count })
  } catch (error) {
    next(error)
  }
}

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { returnDocument: 'after' }
    )
    if (!notification) {
      res.status(404)
      throw new Error('Notification not found')
    }
    res.json(notification)
  } catch (error) {
    next(error)
  }
}

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    next(error)
  }
}

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!notification) {
      res.status(404)
      throw new Error('Notification not found')
    }
    res.json({ message: 'Notification deleted' })
  } catch (error) {
    next(error)
  }
}

const VALID_TYPES = ['info', 'success', 'warning', 'error']

const createNotification = async (req, res, next) => {
  try {
    const { userId, userIds, title, message, type = 'info', email = false } = req.body

    if (!title || !message) {
      res.status(400)
      throw new Error('Title and message are required')
    }
    if (!VALID_TYPES.includes(type)) {
      res.status(400)
      throw new Error(`Type must be one of: ${VALID_TYPES.join(', ')}`)
    }

    const targetIds = userIds && Array.isArray(userIds) && userIds.length ? userIds : userId ? [userId] : null
    if (!targetIds) {
      res.status(400)
      throw new Error('userId or userIds is required')
    }

    const recipients = await User.find({ _id: { $in: targetIds } }).select('name email')
    if (!recipients.length) {
      res.status(404)
      throw new Error('No matching recipients found')
    }

    const notifications = await Notification.insertMany(
      recipients.map((r) => ({ user: r._id, title, message, type }))
    )

    if (email) {
      await Promise.allSettled(
        recipients.map((r) => sendTemplatedEmail('newAnnouncement', r.email, { name: r.name, title, message }))
      )
    }

    res.status(201).json(notifications)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  createNotification,
}
