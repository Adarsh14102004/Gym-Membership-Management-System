const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const { makePayment, getMyPayments, getPaymentReceipt } = require('../controllers/paymentController')

const router = express.Router()

router.use(protect, authorize('member'))

router.route('/').get(getMyPayments).post(makePayment)
router.get('/:id', getPaymentReceipt)

module.exports = router
