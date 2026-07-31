const User = require('../models/User')
const Membership = require('../models/Membership')
const Payment = require('../models/Payment')
const Attendance = require('../models/Attendance')
const { streamPdf, streamExcel } = require('../services/reportService')

const dateRangeFilter = (field, from, to) => {
  const range = {}
  if (from) range.$gte = new Date(from)
  if (to) {
    const end = new Date(to)
    end.setHours(23, 59, 59, 999)
    range.$lte = end
  }
  return Object.keys(range).length ? { [field]: range } : {}
}

const REPORT_BUILDERS = {
  members: async ({ from, to }) => {
    const query = { role: 'member', ...dateRangeFilter('createdAt', from, to) }
    const members = await User.find(query).select('name email phone status createdAt').sort({ createdAt: -1 })

    const memberships = await Membership.find({ member: { $in: members.map((m) => m._id) } })
      .populate('plan', 'name')
      .sort({ createdAt: -1 })
    const membershipMap = new Map()
    memberships.forEach((m) => {
      const key = m.member.toString()
      if (!membershipMap.has(key)) membershipMap.set(key, m)
    })

    return {
      title: 'Members Report',
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
        { key: 'status', label: 'Status' },
        { key: 'plan', label: 'Plan', render: (r) => membershipMap.get(r._id.toString())?.plan?.name || 'None' },
        { key: 'joined', label: 'Joined', render: (r) => new Date(r.createdAt).toLocaleDateString() },
      ],
      rows: members,
    }
  },

  payments: async ({ from, to }) => {
    const query = dateRangeFilter('paymentDate', from, to)
    const payments = await Payment.find(query).populate('member', 'name email').populate('plan', 'name').sort({ paymentDate: -1 })

    return {
      title: 'Payments Report',
      columns: [
        { key: 'member', label: 'Member', render: (r) => r.member?.name || '—' },
        { key: 'plan', label: 'Plan', render: (r) => r.plan?.name || '—' },
        { key: 'amount', label: 'Amount', render: (r) => `$${r.amount}` },
        { key: 'transactionId', label: 'Transaction ID' },
        { key: 'status', label: 'Status', render: (r) => r.paymentStatus },
        { key: 'date', label: 'Date', render: (r) => new Date(r.paymentDate).toLocaleDateString() },
      ],
      rows: payments,
    }
  },

  attendance: async ({ from, to }) => {
    const query = {}
    if (from || to) {
      query.date = {}
      if (from) query.date.$gte = from
      if (to) query.date.$lte = to
    }
    const records = await Attendance.find(query).populate('member', 'name email').sort({ date: -1 })

    return {
      title: 'Attendance Report',
      columns: [
        { key: 'member', label: 'Member', render: (r) => r.member?.name || '—' },
        { key: 'email', label: 'Email', render: (r) => r.member?.email || '—' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status' },
        { key: 'time', label: 'Check-in Time', render: (r) => new Date(r.createdAt).toLocaleTimeString() },
      ],
      rows: records,
    }
  },
}

const buildReportData = async (req) => {
  const { type = 'members', from = '', to = '' } = req.query
  const builder = REPORT_BUILDERS[type]
  if (!builder) {
    const error = new Error('Invalid report type. Use members, payments or attendance.')
    error.statusCode = 400
    throw error
  }
  return builder({ from, to })
}

const generatePdfReport = async (req, res, next) => {
  try {
    const { title, columns, rows } = await buildReportData(req)
    streamPdf(res, { title, columns, rows, filename: `${req.query.type || 'members'}-report` })
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode)
    next(error)
  }
}

const generateExcelReport = async (req, res, next) => {
  try {
    const { title, columns, rows } = await buildReportData(req)
    await streamExcel(res, { title, columns, rows, filename: `${req.query.type || 'members'}-report` })
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode)
    next(error)
  }
}

module.exports = { generatePdfReport, generateExcelReport }
