const express = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const {
  makeDemoPayment,
  getMyPayments,
  getPaymentReceipt,
  createRazorpayOrder,
  verifyRazorpayPayment,
  isRazorpayConfigured,
} = require('../controllers/paymentController')
const { validate, razorpayOrderRules } = require('../middleware/validateMiddleware')

const router = express.Router()

router.use(protect, authorize('member'))

router.get('/', getMyPayments)
router.get('/gateway-status', (req, res) => res.json({ razorpayConfigured: isRazorpayConfigured() }))

router.post('/razorpay/order', validate(razorpayOrderRules), createRazorpayOrder)
router.post('/razorpay/verify', verifyRazorpayPayment)

// Demo/offline checkout — always available so the app is fully demoable
// without live Razorpay credentials.
router.post('/demo', makeDemoPayment)

router.get('/:id', getPaymentReceipt)

module.exports = router
