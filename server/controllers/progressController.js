const ProgressLog = require('../models/ProgressLog')
const User = require('../models/User')
const Notification = require('../models/Notification')

const calcBmi = (weight, height) => (weight && height ? Number((weight / (height / 100) ** 2).toFixed(1)) : null)

const bmiCategory = (bmi) => {
  if (bmi == null) return null
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

const submitProgress = async (req, res, next) => {
  try {
    const { weight, height, bodyFat, notes } = req.body
    const member = await User.findById(req.user._id)

    if (!member.assignedTrainer) {
      res.status(400)
      throw new Error('You do not have an assigned trainer yet')
    }

    const effectiveHeight = height || member.height
    const bmi = calcBmi(weight, effectiveHeight)

    const log = await ProgressLog.create({
      member: req.user._id,
      trainer: member.assignedTrainer,
      weight,
      height: height || null,
      bmi,
      bodyFat,
      notes,
    })

    if (height && height !== member.height) {
      member.height = height
      await member.save()
    }

    res.status(201).json(log)
  } catch (error) {
    next(error)
  }
}

const updateProgress = async (req, res, next) => {
  try {
    const log = await ProgressLog.findOne({ _id: req.params.id, member: req.user._id })
    if (!log) {
      res.status(404)
      throw new Error('Progress entry not found')
    }
    if (log.status !== 'pending') {
      res.status(400)
      throw new Error('Only pending entries can be edited')
    }

    const { weight, height, bodyFat, notes } = req.body
    if (weight !== undefined) log.weight = weight
    if (height !== undefined) log.height = height
    if (bodyFat !== undefined) log.bodyFat = bodyFat
    if (notes !== undefined) log.notes = notes

    const member = await User.findById(req.user._id)
    log.bmi = calcBmi(log.weight, log.height || member.height)

    await log.save()
    res.json(log)
  } catch (error) {
    next(error)
  }
}

const deleteProgress = async (req, res, next) => {
  try {
    const log = await ProgressLog.findOneAndDelete({ _id: req.params.id, member: req.user._id })
    if (!log) {
      res.status(404)
      throw new Error('Progress entry not found')
    }
    res.json({ message: 'Progress entry deleted' })
  } catch (error) {
    next(error)
  }
}

const calculateBmi = async (req, res, next) => {
  try {
    const weight = Number(req.query.weight)
    const height = Number(req.query.height)
    if (!weight || !height) {
      res.status(400)
      throw new Error('Weight and height are required')
    }
    const bmi = calcBmi(weight, height)
    res.json({ bmi, category: bmiCategory(bmi) })
  } catch (error) {
    next(error)
  }
}

const listProgress = async (req, res, next) => {
  try {
    const { status = '' } = req.query
    const query = { trainer: req.user._id }
    if (status) query.status = status

    const logs = await ProgressLog.find(query).populate('member', 'name email').sort({ createdAt: -1 })
    res.json(logs)
  } catch (error) {
    next(error)
  }
}

const reviewProgress = async (req, res, next) => {
  try {
    const log = await ProgressLog.findOne({ _id: req.params.id, trainer: req.user._id })
    if (!log) {
      res.status(404)
      throw new Error('Progress log not found')
    }

    const { status, trainerNote } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400)
      throw new Error('Status must be approved or rejected')
    }

    log.status = status
    if (trainerNote !== undefined) log.trainerNote = trainerNote

    await log.save()

    await Notification.create({
      user: log.member,
      title: `Progress ${status}`,
      message:
        status === 'approved'
          ? `Your trainer approved your latest progress update.${trainerNote ? ` Note: ${trainerNote}` : ''}`
          : `Your trainer rejected your latest progress update.${trainerNote ? ` Note: ${trainerNote}` : ''}`,
      type: status === 'approved' ? 'success' : 'warning',
    })

    res.json(log)
  } catch (error) {
    next(error)
  }
}

const getMyProgress = async (req, res, next) => {
  try {
    const member = await User.findById(req.user._id)
    const logs = await ProgressLog.find({ member: req.user._id }).sort({ createdAt: 1 })

    const withBmi = logs.map((log) => {
      if (log.bmi != null) return log.toObject()
      const bmi = calcBmi(log.weight, log.height || member.height)
      return { ...log.toObject(), bmi }
    })

    res.json(withBmi)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  submitProgress,
  updateProgress,
  deleteProgress,
  calculateBmi,
  listProgress,
  reviewProgress,
  getMyProgress,
}
