const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['present'],
      default: 'present',
    },
  },
  { timestamps: true }
)

attendanceSchema.index({ member: 1, date: 1 }, { unique: true })
attendanceSchema.index({ date: 1 })

module.exports = mongoose.model('Attendance', attendanceSchema)
