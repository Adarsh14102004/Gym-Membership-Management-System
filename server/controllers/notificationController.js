const Notification = require('../models/Notification')

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30)
    res.json(notifications)
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

module.exports = { getNotifications, markNotificationRead }
