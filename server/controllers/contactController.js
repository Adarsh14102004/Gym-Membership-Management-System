const Contact = require('../models/Contact')
const { sendTemplatedEmail } = require('../services/emailService')

// Public — anyone can submit the contact form, no auth required.
const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body

    const contact = await Contact.create({ name, email, subject, message })

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER
    if (adminEmail) {
      sendTemplatedEmail('contactFormReceived', adminEmail, { name, email, subject, message }).catch(() => {})
    }

    res.status(201).json({ message: 'Thanks for reaching out — we will get back to you soon.', contact })
  } catch (error) {
    next(error)
  }
}

// Admin — paginated inbox of submissions.
const listContacts = async (req, res, next) => {
  try {
    const { status = '', page = 1, limit = 10 } = req.query

    const query = {}
    if (status) query.status = status

    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Number(limit) || 10)
    const skip = (pageNum - 1) * limitNum

    const [data, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Contact.countDocuments(query),
    ])

    res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 })
  } catch (error) {
    next(error)
  }
}

// Admin — mark a submission as read.
const markContactRead = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true })
    if (!contact) {
      res.status(404)
      throw new Error('Contact submission not found')
    }
    res.json(contact)
  } catch (error) {
    next(error)
  }
}

// Admin — remove a submission.
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id)
    if (!contact) {
      res.status(404)
      throw new Error('Contact submission not found')
    }
    res.json({ message: 'Contact submission deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = { submitContact, listContacts, markContactRead, deleteContact }
