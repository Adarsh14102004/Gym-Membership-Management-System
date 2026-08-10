const nodemailer = require('nodemailer')

let transporter = null
let attempted = false

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null
  if (!transporter && !attempted) {
    attempted = true
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return transporter
}

const isValidEmail = (email) => typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email)

const sendEmail = async ({ to, subject, html }) => {
  if (!isValidEmail(to)) return { sent: false, reason: 'Invalid recipient email address' }

  const t = getTransporter()
  if (!t) return { sent: false, reason: 'Email service is not configured' }

  try {
    await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html })
    return { sent: true }
  } catch (error) {
    return { sent: false, reason: error.message }
  }
}

const wrapTemplate = (heading, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #111827; color: #f3f4f6; border-radius: 16px;">
    <h2 style="color: #ff3b30; margin: 0 0 16px;">${heading}</h2>
    <div style="font-size: 14px; line-height: 1.6; color: #d1d5db;">${bodyHtml}</div>
    <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">FITZONE Gym Management</p>
  </div>
`

const templates = {
  membershipExpiryReminder: ({ name, planName, daysRemaining, expiryDate }) => ({
    subject: 'Your membership is expiring soon',
    html: wrapTemplate(
      'Membership Expiring Soon',
      `<p>Hi ${name},</p><p>Your <strong>${planName}</strong> plan expires in <strong>${daysRemaining} day(s)</strong> (on ${new Date(
        expiryDate
      ).toLocaleDateString()}). Renew now to avoid an interruption in access.</p>`
    ),
  }),

  renewalReminder: ({ name, planName, amount, expiryDate }) => ({
    subject: 'Membership renewed successfully',
    html: wrapTemplate(
      'Renewal Successful',
      `<p>Hi ${name},</p><p>Your payment of <strong>$${amount}</strong> for the <strong>${planName}</strong> plan was successful. Your membership is now active until ${new Date(
        expiryDate
      ).toLocaleDateString()}.</p>`
    ),
  }),

  classBookingConfirmation: ({ name, classTitle, date, startTime }) => ({
    subject: 'Class booking confirmed',
    html: wrapTemplate(
      'Booking Confirmed',
      `<p>Hi ${name},</p><p>You're booked for <strong>${classTitle}</strong> on ${new Date(
        date
      ).toLocaleDateString()} at ${startTime}. See you there!</p>`
    ),
  }),

  classCancellation: ({ name, classTitle, date }) => ({
    subject: 'Class booking cancelled',
    html: wrapTemplate(
      'Booking Cancelled',
      `<p>Hi ${name},</p><p>Your booking for <strong>${classTitle}</strong> on ${new Date(date).toLocaleDateString()} has been cancelled.</p>`
    ),
  }),

  newAnnouncement: ({ name, title, message }) => ({
    subject: `Announcement: ${title}`,
    html: wrapTemplate(title, `<p>Hi ${name},</p><p>${message}</p>`),
  }),

  passwordReset: ({ name, resetUrl }) => ({
    subject: 'Reset your FITZONE password',
    html: wrapTemplate(
      'Password Reset Requested',
      `<p>Hi ${name},</p><p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
       <p style="margin: 24px 0;"><a href="${resetUrl}" style="background:#ff3b30;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a></p>
       <p style="color:#9ca3af;">If you didn't request this, you can safely ignore this email — your password will remain unchanged.</p>
       <p style="color:#6b7280; font-size:12px; word-break:break-all;">Or paste this link into your browser: ${resetUrl}</p>`
    ),
  }),

  contactFormReceived: ({ name, email, subject, message }) => ({
    subject: `New contact form message: ${subject}`,
    html: wrapTemplate(
      'New Contact Form Submission',
      `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p>${message}</p>`
    ),
  }),
}

const sendTemplatedEmail = async (templateName, to, data) => {
  const build = templates[templateName]
  if (!build) return { sent: false, reason: `Unknown email template: ${templateName}` }
  const { subject, html } = build(data)
  return sendEmail({ to, subject, html })
}

module.exports = { sendEmail, sendTemplatedEmail, isValidEmail, templates }
