const mongoose = require('mongoose')

const exerciseVideoSchema = new mongoose.Schema(
  {
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    url: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('ExerciseVideo', exerciseVideoSchema)
