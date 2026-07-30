const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const { listClasses, listMyClasses, getClass, createClass, updateClass, deleteClass } = require('../controllers/classController')
const { classMembers } = require('../controllers/bookingController')

const router = express.Router()

router.get('/', protect, listClasses)
router.get('/my', protect, authorize('trainer'), listMyClasses)
router.post('/', protect, authorize('admin'), createClass)
router.get('/:id', protect, getClass)
router.put('/:id', protect, authorize('admin'), updateClass)
router.delete('/:id', protect, authorize('admin'), deleteClass)
router.get('/:id/members', protect, authorize('trainer', 'admin'), classMembers)

module.exports = router
