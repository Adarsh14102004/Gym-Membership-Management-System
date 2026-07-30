const Booking = require('../models/Booking')
const Class = require('../models/Class')

const isPastClass = (cls) => {
  const [hours, minutes] = cls.startTime.split(':').map(Number)
  const classDateTime = new Date(cls.date)
  classDateTime.setHours(hours || 0, minutes || 0, 0, 0)
  return classDateTime < new Date()
}

const bookClass = async (req, res, next) => {
  try {
    const { classId } = req.body
    if (!classId) {
      res.status(400)
      throw new Error('Class is required')
    }

    const cls = await Class.findById(classId)
    if (!cls) {
      res.status(404)
      throw new Error('Class not found')
    }

    if (cls.status !== 'upcoming') {
      res.status(400)
      throw new Error('This class is no longer available for booking')
    }

    if (isPastClass(cls)) {
      res.status(400)
      throw new Error('Cannot book a class that has already started or passed')
    }

    if (cls.bookedSeats >= cls.capacity) {
      res.status(400)
      throw new Error('This class is fully booked')
    }

    const existing = await Booking.findOne({ member: req.user._id, class: classId, status: 'booked' })
    if (existing) {
      res.status(400)
      throw new Error('You have already booked this class')
    }

    const booking = await Booking.create({ member: req.user._id, class: classId })
    cls.bookedSeats += 1
    await cls.save()

    await booking.populate({ path: 'class', populate: { path: 'trainer', select: 'name' } })
    res.status(201).json(booking)
  } catch (error) {
    if (error.code === 11000) {
      res.status(400)
      return next(new Error('You have already booked this class'))
    }
    next(error)
  }
}

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, member: req.user._id })
    if (!booking) {
      res.status(404)
      throw new Error('Booking not found')
    }
    if (booking.status === 'cancelled') {
      res.status(400)
      throw new Error('Booking is already cancelled')
    }

    booking.status = 'cancelled'
    await booking.save()

    await Class.findByIdAndUpdate(booking.class, { $inc: { bookedSeats: -1 } })

    res.json({ message: 'Booking cancelled' })
  } catch (error) {
    next(error)
  }
}

const myBookings = async (req, res, next) => {
  try {
    const { status = '' } = req.query
    const query = { member: req.user._id }
    if (status) query.status = status

    const bookings = await Booking.find(query)
      .populate({ path: 'class', populate: { path: 'trainer', select: 'name' } })
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    next(error)
  }
}

const classMembers = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id)
    if (!cls) {
      res.status(404)
      throw new Error('Class not found')
    }

    if (req.user.role === 'trainer' && cls.trainer.toString() !== req.user._id.toString()) {
      res.status(403)
      throw new Error('You can only view members of your own classes')
    }

    const bookings = await Booking.find({ class: cls._id, status: 'booked' }).populate('member', 'name email phone')

    res.json({ class: cls, members: bookings.map((b) => b.member) })
  } catch (error) {
    next(error)
  }
}

module.exports = { bookClass, cancelBooking, myBookings, classMembers }
