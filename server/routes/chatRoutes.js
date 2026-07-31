const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { getMessages, sendMessage, markRead, getUnreadCount } = require('../controllers/chatController')

const router = express.Router()

router.use(protect)

router.get('/unread-count', getUnreadCount)
router.route('/:userId').get(getMessages).post(sendMessage)
router.put('/:userId/read', markRead)

module.exports = router
