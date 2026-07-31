const mongoose = require('mongoose')

const membershipSchema = new mongoose.Schema(
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
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'active',
    },
  },
  { timestamps: true }
)

membershipSchema.index({ member: 1 })
membershipSchema.index({ status: 1, endDate: 1 })

module.exports = mongoose.model('Membership', membershipSchema)
