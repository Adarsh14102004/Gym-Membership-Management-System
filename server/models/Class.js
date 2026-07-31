const mongoose = require('mongoose')

const classSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['Yoga', 'Cardio', 'Strength', 'Zumba', 'HIIT', 'Pilates'],
      required: [true, 'Category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    bookedSeats: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
)

classSchema.index({ date: 1, startTime: 1 })
classSchema.index({ trainer: 1 })

module.exports = mongoose.model('Class', classSchema)
