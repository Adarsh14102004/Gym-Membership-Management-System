const Class = require('../models/Class')
const Booking = require('../models/Booking')
const User = require('../models/User')

const CATEGORIES = ['Yoga', 'Cardio', 'Strength', 'Zumba', 'HIIT', 'Pilates']

const withSeats = (cls) => ({
  ...(cls.toObject ? cls.toObject() : cls),
  seatsLeft: Math.max(cls.capacity - cls.bookedSeats, 0),
})

const listClasses = async (req, res, next) => {
  try {
    const { search = '', category = '', trainer = '', date = '', upcoming, page = 1, limit = 50 } = req.query
    const query = {}

    if (search) query.title = { $regex: search, $options: 'i' }
    if (category) query.category = category
    if (trainer) query.trainer = trainer

    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      query.date = { $gte: start, $lt: end }
    } else if (upcoming === 'true') {
      query.date = { $gte: new Date(new Date().toDateString()) }
    }

    if (upcoming === 'true') query.status = { $ne: 'cancelled' }

    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Number(limit) || 50)
    const skip = (pageNum - 1) * limitNum

    const [classes, total] = await Promise.all([
      Class.find(query).populate('trainer', 'name').sort({ date: 1, startTime: 1 }).skip(skip).limit(limitNum),
      Class.countDocuments(query),
    ])

    let bookedIds = []
    if (req.user.role === 'member' && classes.length) {
      const bookings = await Booking.find({
        member: req.user._id,
        status: 'booked',
        class: { $in: classes.map((c) => c._id) },
      })
      bookedIds = bookings.map((b) => b.class.toString())
    }

    const data = classes.map((c) => ({ ...withSeats(c), booked: bookedIds.includes(c._id.toString()) }))

    res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1, categories: CATEGORIES })
  } catch (error) {
    next(error)
  }
}

const listMyClasses = async (req, res, next) => {
  try {
    const { search = '', category = '', date = '' } = req.query
    const query = { trainer: req.user._id }

    if (search) query.title = { $regex: search, $options: 'i' }
    if (category) query.category = category
    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      query.date = { $gte: start, $lt: end }
    }

    const classes = await Class.find(query).sort({ date: 1, startTime: 1 })
    res.json(classes.map(withSeats))
  } catch (error) {
    next(error)
  }
}

const getClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id).populate('trainer', 'name email specialization')
    if (!cls) {
      res.status(404)
      throw new Error('Class not found')
    }

    let booked = false
    if (req.user.role === 'member') {
      booked = !!(await Booking.findOne({ member: req.user._id, class: cls._id, status: 'booked' }))
    }

    res.json({ ...withSeats(cls), booked })
  } catch (error) {
    next(error)
  }
}

const createClass = async (req, res, next) => {
  try {
    const { title, description, trainer, category, date, startTime, endTime, capacity } = req.body

    if (!title || !trainer || !category || !date || !startTime || !endTime || !capacity) {
      res.status(400)
      throw new Error('All fields are required')
    }

    if (new Date(date) < new Date(new Date().toDateString())) {
      res.status(400)
      throw new Error('Cannot schedule a class in the past')
    }

    if (Number(capacity) < 1) {
      res.status(400)
      throw new Error('Capacity must be at least 1')
    }

    const trainerUser = await User.findOne({ _id: trainer, role: 'trainer' })
    if (!trainerUser) {
      res.status(400)
      throw new Error('Selected trainer not found')
    }

    const cls = await Class.create({
      title,
      description,
      trainer,
      category,
      date,
      startTime,
      endTime,
      capacity: Number(capacity),
    })

    res.status(201).json(cls)
  } catch (error) {
    next(error)
  }
}

const updateClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id)
    if (!cls) {
      res.status(404)
      throw new Error('Class not found')
    }

    const { title, description, trainer, category, date, startTime, endTime, capacity, status } = req.body

    if (date && new Date(date) < new Date(new Date().toDateString())) {
      res.status(400)
      throw new Error('Cannot schedule a class in the past')
    }

    if (trainer) {
      const trainerUser = await User.findOne({ _id: trainer, role: 'trainer' })
      if (!trainerUser) {
        res.status(400)
        throw new Error('Selected trainer not found')
      }
      cls.trainer = trainer
    }

    if (capacity !== undefined) {
      if (Number(capacity) < cls.bookedSeats) {
        res.status(400)
        throw new Error(`Capacity cannot be less than already booked seats (${cls.bookedSeats})`)
      }
      cls.capacity = Number(capacity)
    }

    if (title) cls.title = title
    if (description !== undefined) cls.description = description
    if (category) cls.category = category
    if (date) cls.date = date
    if (startTime) cls.startTime = startTime
    if (endTime) cls.endTime = endTime
    if (status) cls.status = status

    await cls.save()
    res.json(cls)
  } catch (error) {
    next(error)
  }
}

const deleteClass = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id)
    if (!cls) {
      res.status(404)
      throw new Error('Class not found')
    }
    await Booking.deleteMany({ class: cls._id })
    res.json({ message: 'Class deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  CATEGORIES,
  listClasses,
  listMyClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
}
