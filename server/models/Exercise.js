const mongoose = require('mongoose')

const exerciseSchema = new mongoose.Schema(
  {
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Strength', 'Cardio', 'Flexibility', 'Balance', 'Core'],
      required: [true, 'Category is required'],
    },
    muscleGroup: {
      type: String,
      enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'],
      required: [true, 'Muscle group is required'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    sets: {
      type: Number,
      default: null,
    },
    reps: {
      type: Number,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    video: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Exercise', exerciseSchema)
