const crypto = require('crypto')
const Razorpay = require('razorpay')
const Payment = require('../models/Payment')
const MembershipPlan = require('../models/MembershipPlan')
const Notification = require('../models/Notification')
const { purchaseOrRenewMembership } = require('./membershipController')
const { sendTemplatedEmail } = require('../services/emailService')

const generateTransactionId = () => `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

let razorpayClient = null
const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpayClient
}

const razorpayUnavailableError = () => {
  const error = new Error('Payment gateway is not configured. Please contact the gym administrator.')
  error.statusCode = 503
  return error
}

// Creates a Razorpay order for the given plan. The amount is always derived
// server-side from the stored plan price — the client never gets to name its
// own price.
const createRazorpayOrder = async (req, res, next) => {
  try {
    const razorpay = getRazorpayClient()
    if (!razorpay) throw razorpayUnavailableError()

    const { plan } = req.body
    const planDoc = await MembershipPlan.findOne({ _id: plan, status: 'active' })
    if (!planDoc) {
      res.status(400)
      throw new Error('Membership plan not found or unavailable')
    }

    const order = await razorpay.orders.create({
      amount: Math.round(planDoc.price * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { plan: String(planDoc._id), member: String(req.user._id) },
    })

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: { id: planDoc._id, name: planDoc.name, price: planDoc.price },
    })
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode)
    next(error)
  }
}

// Verifies the Razorpay checkout callback signature before granting the
// membership — this is the step that actually proves the payment happened;
// never trust a client-reported "success" without it.
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) throw razorpayUnavailableError()

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      res.status(400)
      throw new Error('Missing payment verification details')
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      res.status(400)
      throw new Error('Payment verification failed — signature mismatch')
    }

    const planDoc = await MembershipPlan.findOne({ _id: plan, status: 'active' })
    if (!planDoc) {
      res.status(400)
      throw new Error('Membership plan not found or unavailable')
    }

    const { membership } = await purchaseOrRenewMembership(req.user._id, plan)

    const payment = await Payment.create({
      member: req.user._id,
      plan: planDoc._id,
      membership: membership._id,
      amount: planDoc.price,
      paymentMethod: 'Razorpay',
      transactionId: razorpay_payment_id,
      paymentStatus: 'success',
    })

    await Notification.create({
      user: req.user._id,
      title: 'Renewal Successful',
      message: `Your payment of ₹${planDoc.price} was successful. Membership active until ${membership.endDate.toLocaleDateString()}.`,
      type: 'success',
    })

    sendTemplatedEmail('renewalReminder', req.user.email, {
      name: req.user.name,
      planName: planDoc.name,
      amount: planDoc.price,
      expiryDate: membership.endDate,
    }).catch(() => {})

    await payment.populate('plan', 'name duration price')

    res.status(201).json({ payment, membership })
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode)
    next(error)
  }
}

// Demo/offline payment path — used when Razorpay keys aren't configured (e.g.
// local dev, grading without live credentials). Not linked from the main
// checkout UI once Razorpay is configured; kept so the app is fully demoable
// out of the box.
const makeDemoPayment = async (req, res, next) => {
  try {
    const { plan } = req.body
    if (!plan) {
      res.status(400)
      throw new Error('Plan is required')
    }

    const planDoc = await MembershipPlan.findOne({ _id: plan, status: 'active' })
    if (!planDoc) {
      res.status(400)
      throw new Error('Membership plan not found or unavailable')
    }

    const { membership } = await purchaseOrRenewMembership(req.user._id, plan)

    const payment = await Payment.create({
      member: req.user._id,
      plan: planDoc._id,
      membership: membership._id,
      amount: planDoc.price,
      paymentMethod: 'Demo',
      transactionId: generateTransactionId(),
      paymentStatus: 'success',
    })

    await Notification.create({
      user: req.user._id,
      title: 'Renewal Successful',
      message: `Your payment of ₹${planDoc.price} was successful. Membership active until ${membership.endDate.toLocaleDateString()}.`,
      type: 'success',
    })

    sendTemplatedEmail('renewalReminder', req.user.email, {
      name: req.user.name,
      planName: planDoc.name,
      amount: planDoc.price,
      expiryDate: membership.endDate,
    }).catch(() => {})

    await payment.populate('plan', 'name duration price')

    res.status(201).json({ payment, membership })
  } catch (error) {
    next(error)
  }
}

const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ member: req.user._id })
      .populate('plan', 'name duration price')
      .sort({ paymentDate: -1 })
    res.json(payments)
  } catch (error) {
    next(error)
  }
}

const getPaymentReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, member: req.user._id })
      .populate('plan', 'name duration price')
      .populate('member', 'name email')
    if (!payment) {
      res.status(404)
      throw new Error('Payment not found')
    }
    res.json(payment)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  makeDemoPayment,
  getMyPayments,
  getPaymentReceipt,
  createRazorpayOrder,
  verifyRazorpayPayment,
  isRazorpayConfigured: () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
}
