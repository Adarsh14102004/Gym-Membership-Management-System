const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goal: {
      type: String,
      required: [true, 'Goal description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Weight Loss', 'Muscle Gain', 'Strength', 'Endurance', 'General Fitness'],
      default: 'General Fitness',
    },
    startWeight: {
      type: Number,
      required: true,
    },
    targetWeight: {
      type: Number,
      required: [true, 'Target weight is required'],
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
    status: {
      type: String,
      enum: ['active', 'achieved', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Goal', goalSchema)
