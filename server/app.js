const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const trainerRoutes = require('./routes/trainerRoutes')
const memberRoutes = require('./routes/memberRoutes')
const progressRoutes = require('./routes/progressRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const chatRoutes = require('./routes/chatRoutes')
const classRoutes = require('./routes/classRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const aiRoutes = require('./routes/aiRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const reportRoutes = require('./routes/reportRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/trainer', trainerRoutes)
app.use('/api/member', memberRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/admin/analytics', analyticsRoutes)
app.use('/api/admin/reports', reportRoutes)
app.use('/api/notifications', notificationRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
