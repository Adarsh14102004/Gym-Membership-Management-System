const Booking = require('../models/Booking')
const Class = require('../models/Class')
const Notification = require('../models/Notification')
const { sendTemplatedEmail } = require('../services/emailService')

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

    await Notification.create({
      user: req.user._id,
      title: 'Class Booked',
      message: `You're booked for ${cls.title} on ${new Date(cls.date).toLocaleDateString()} at ${cls.startTime}.`,
      type: 'success',
    })
    sendTemplatedEmail('classBookingConfirmation', req.user.email, {
      name: req.user.name,
      classTitle: cls.title,
      date: cls.date,
      startTime: cls.startTime,
    }).catch(() => {})

    if (cls.trainer) {
      await Notification.create({
        user: cls.trainer,
        title: 'New Class Booking',
        message: `${req.user.name} booked your class "${cls.title}" on ${new Date(cls.date).toLocaleDateString()}.`,
        type: 'info',
      })
    }

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

    const cls = await Class.findByIdAndUpdate(booking.class, { $inc: { bookedSeats: -1 } }, { returnDocument: 'after' })

    if (cls) {
      await Notification.create({
        user: req.user._id,
        title: 'Booking Cancelled',
        message: `Your booking for ${cls.title} on ${new Date(cls.date).toLocaleDateString()} has been cancelled.`,
        type: 'info',
      })
      sendTemplatedEmail('classCancellation', req.user.email, {
        name: req.user.name,
        classTitle: cls.title,
        date: cls.date,
      }).catch(() => {})

      if (cls.trainer) {
        await Notification.create({
          user: cls.trainer,
          title: 'Booking Cancelled',
          message: `${req.user.name} cancelled their booking for "${cls.title}" on ${new Date(cls.date).toLocaleDateString()}.`,
          type: 'info',
        })
      }
    }

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
