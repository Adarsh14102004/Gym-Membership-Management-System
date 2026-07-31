const mongoose = require('mongoose')

const progressLogSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weight: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    bmi: {
      type: Number,
      default: null,
    },
    bodyFat: {
      type: Number,
      default: null,
    },
    chest: {
      type: Number,
      default: null,
    },
    waist: {
      type: Number,
      default: null,
    },
    arms: {
      type: Number,
      default: null,
    },
    thighs: {
      type: Number,
      default: null,
    },
    progressImage: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    trainerNote: {
      type: String,
      trim: true,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

progressLogSchema.index({ member: 1, createdAt: -1 })
progressLogSchema.index({ trainer: 1, status: 1 })

module.exports = mongoose.model('ProgressLog', progressLogSchema)
