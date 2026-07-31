const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'trainer', 'member'],
      default: 'member',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      default: null,
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    height: {
      type: Number,
      default: null,
    },
    profilePicture: {
      type: String,
      trim: true,
      default: '',
    },
    membershipStartDate: {
      type: Date,
      default: Date.now,
    },
    notifyByEmail: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

userSchema.index({ role: 1 })
userSchema.index({ assignedTrainer: 1 })

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
