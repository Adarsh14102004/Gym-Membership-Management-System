const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { getMessages, sendMessage } = require('../controllers/chatController')

const router = express.Router()

router.use(protect)

router.route('/:userId').get(getMessages).post(sendMessage)

module.exports = router
