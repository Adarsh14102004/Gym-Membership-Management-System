const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const { submitProgress, updateProgress, deleteProgress, calculateBmi, getMyProgress } = require('../controllers/progressController')

const router = express.Router()

router.post('/', protect, authorize('member'), submitProgress)
router.get('/mine', protect, authorize('member'), getMyProgress)
router.get('/bmi', protect, authorize('member'), calculateBmi)
router.put('/:id', protect, authorize('member'), updateProgress)
router.delete('/:id', protect, authorize('member'), deleteProgress)

module.exports = router
