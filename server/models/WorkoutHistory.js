const mongoose = require('mongoose')

const workoutHistorySchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workoutPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
      required: true,
    },
    completedExercises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
      },
    ],
    duration: {
      type: Number,
      default: null,
    },
    caloriesBurned: {
      type: Number,
      default: null,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['completed', 'partial'],
      default: 'completed',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('WorkoutHistory', workoutHistorySchema)
