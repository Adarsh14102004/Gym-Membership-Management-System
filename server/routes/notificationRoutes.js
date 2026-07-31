const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  createNotification,
} = require('../controllers/notificationController')

const router = express.Router()

router.use(protect)

router.get('/', getNotifications)
router.get('/unread-count', getUnreadCount)
router.put('/read-all', markAllRead)
router.put('/:id/read', markNotificationRead)
router.delete('/:id', deleteNotification)

router.post('/', authorize('admin', 'trainer'), createNotification)

module.exports = router
