const User = require('../models/User')

const getProfile = async (req, res, next) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      specialization: req.user.specialization,
      bio: req.user.bio,
    })
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, specialization, bio } = req.body
    const trainer = await User.findById(req.user._id)

    if (name) trainer.name = name
    if (phone !== undefined) trainer.phone = phone
    if (specialization !== undefined) trainer.specialization = specialization
    if (bio !== undefined) trainer.bio = bio

    await trainer.save()
    res.json({
      _id: trainer._id,
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
      bio: trainer.bio,
    })
  } catch (error) {
    next(error)
  }
}

const listMyMembers = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 8 } = req.query
    const query = { role: 'member', assignedTrainer: req.user._id }

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

const listAvailableMembers = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 8 } = req.query
    const query = { role: 'member', assignedTrainer: null }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

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

const assignMember = async (req, res, next) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' })
    if (!member) {
      res.status(404)
      throw new Error('Member not found')
    }
    if (member.assignedTrainer && String(member.assignedTrainer) !== String(req.user._id)) {
      res.status(400)
      throw new Error('Member is already assigned to another trainer')
    }

    member.assignedTrainer = req.user._id
    await member.save()
    res.json(member)
  } catch (error) {
    next(error)
  }
}

const unassignMember = async (req, res, next) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member', assignedTrainer: req.user._id })
    if (!member) {
      res.status(404)
      throw new Error('Member not found in your assigned list')
    }

    member.assignedTrainer = null
    await member.save()
    res.json(member)
  } catch (error) {
    next(error)
  }
}

module.exports = { getProfile, updateProfile, listMyMembers, listAvailableMembers, assignMember, unassignMember }
