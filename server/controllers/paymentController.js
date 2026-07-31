const crypto = require('crypto')
const Payment = require('../models/Payment')
const MembershipPlan = require('../models/MembershipPlan')
const Notification = require('../models/Notification')
const { purchaseOrRenewMembership } = require('./membershipController')
const { sendTemplatedEmail } = require('../services/emailService')

const generateTransactionId = () => `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

const makePayment = async (req, res, next) => {
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
      paymentMethod: 'Dummy',
      transactionId: generateTransactionId(),
      paymentStatus: 'success',
    })

    await Notification.create({
      user: req.user._id,
      title: 'Renewal Successful',
      message: `Your payment of $${planDoc.price} was successful. Membership active until ${membership.endDate.toLocaleDateString()}.`,
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

module.exports = { makePayment, getMyPayments, getPaymentReceipt }
