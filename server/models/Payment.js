const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    membership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: 'Dummy',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  { timestamps: true }
)

paymentSchema.index({ member: 1 })
paymentSchema.index({ paymentDate: -1 })

module.exports = mongoose.model('Payment', paymentSchema)
