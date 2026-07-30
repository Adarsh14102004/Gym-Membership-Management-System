const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const { bookClass, cancelBooking, myBookings } = require('../controllers/bookingController')

const router = express.Router()

router.use(protect, authorize('member'))

router.post('/', bookClass)
router.get('/my', myBookings)
router.put('/:id/cancel', cancelBooking)

module.exports = router
