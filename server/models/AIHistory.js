const mongoose = require('mongoose')

const aiHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['workout', 'diet', 'chatbot', 'bmi', 'prediction'],
      required: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('AIHistory', aiHistorySchema)
