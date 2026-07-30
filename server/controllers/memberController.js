const User = require('../models/User')

const listMembers = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 8 } = req.query
    const query = { role: 'member' }

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
      User.find(query)
        .populate('membershipPlan', 'name price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ])

    res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 })
  } catch (error) {
    next(error)
  }
}

const createMember = async (req, res, next) => {
  try {
    const { name, email, password, phone, membershipPlan, status } = req.body

    if (!name || !email || !password) {
      res.status(400)
      throw new Error('Name, email and password are required')
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      res.status(400)
      throw new Error('User already exists with this email')
    }

    const member = await User.create({
      name,
      email,
      password,
      phone,
      status,
      membershipPlan: membershipPlan || null,
      role: 'member',
    })
    member.password = undefined

    res.status(201).json(member)
  } catch (error) {
    next(error)
  }
}

const updateMember = async (req, res, next) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' })
    if (!member) {
      res.status(404)
      throw new Error('Member not found')
    }

    const { name, email, phone, membershipPlan, status, password } = req.body
    if (name) member.name = name
    if (email) member.email = email
    if (phone !== undefined) member.phone = phone
    if (membershipPlan !== undefined) member.membershipPlan = membershipPlan || null
    if (status) member.status = status
    if (password) member.password = password

    await member.save()
    res.json(member)
  } catch (error) {
    next(error)
  }
}

const deleteMember = async (req, res, next) => {
  try {
    const member = await User.findOneAndDelete({ _id: req.params.id, role: 'member' })
    if (!member) {
      res.status(404)
      throw new Error('Member not found')
    }
    res.json({ message: 'Member deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = { listMembers, createMember, updateMember, deleteMember }
