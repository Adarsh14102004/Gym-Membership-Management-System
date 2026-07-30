const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['booked', 'cancelled'],
      default: 'booked',
    },
  },
  { timestamps: true }
)

bookingSchema.index(
  { member: 1, class: 1 },
  { unique: true, partialFilterExpression: { status: 'booked' } }
)

module.exports = mongoose.model('Booking', bookingSchema)
