const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const helmet = require('helmet')
const { sanitizeInput } = require('./middleware/sanitizeMiddleware')
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
const contactRoutes = require('./routes/contactRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

// Running behind Railway/Render/Vercel's reverse proxy — needed for
// express-rate-limit and secure cookies to see the real client IP/protocol.
app.set('trust proxy', 1)

// Allow-list CORS: only the configured frontend origin(s) may call the API.
// CLIENT_URL supports a comma-separated list for multiple environments
// (e.g. local dev + the deployed Vercel URL). Falls back to localhost so
// `npm run dev` keeps working with zero config.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl, mobile, server-to-server) with no origin header.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(express.json({ limit: '2mb' }))
app.use(sanitizeInput)
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
app.use('/api/contact', contactRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
