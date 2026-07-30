const User = require('../models/User')

const listTrainers = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 8 } = req.query
    const query = { role: 'trainer' }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }
    if (status) query.status = status

    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Number(limit) || 8)
    const skip = (pageNum - 1) * limitNum

    const [data, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ])

    res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 })
  } catch (error) {
    next(error)
  }
}

const createTrainer = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialization, status } = req.body

    if (!name || !email || !password) {
      res.status(400)
      throw new Error('Name, email and password are required')
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      res.status(400)
      throw new Error('User already exists with this email')
    }

    const trainer = await User.create({
      name,
      email,
      password,
      phone,
      specialization,
      status,
      role: 'trainer',
    })
    trainer.password = undefined

    res.status(201).json(trainer)
  } catch (error) {
    next(error)
  }
}

const updateTrainer = async (req, res, next) => {
  try {
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' })
    if (!trainer) {
      res.status(404)
      throw new Error('Trainer not found')
    }

    const { name, email, phone, specialization, status, password } = req.body
    if (name) trainer.name = name
    if (email) trainer.email = email
    if (phone !== undefined) trainer.phone = phone
    if (specialization !== undefined) trainer.specialization = specialization
    if (status) trainer.status = status
    if (password) trainer.password = password

    await trainer.save()
    res.json(trainer)
  } catch (error) {
    next(error)
  }
}

const deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await User.findOneAndDelete({ _id: req.params.id, role: 'trainer' })
    if (!trainer) {
      res.status(404)
      throw new Error('Trainer not found')
    }
    res.json({ message: 'Trainer deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = { listTrainers, createTrainer, updateTrainer, deleteTrainer }
