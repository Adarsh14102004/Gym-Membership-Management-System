const cron = require('node-cron')
const { sweepExpiryReminders } = require('../controllers/membershipController')

// Runs once a day at 08:00 server time: expires any membership past its end
// date, then emails/notifies members whose membership expires within
// EXPIRY_REMINDER_DAYS. This is what makes renewal reminders "auto" — the
// same logic also runs reactively when a member opens My Membership, so this
// job is a safety net that reaches members who never visit that page.
const SCHEDULE = process.env.MEMBERSHIP_CRON_SCHEDULE || '0 8 * * *'

const startMembershipCron = () => {
  cron.schedule(SCHEDULE, async () => {
    try {
      const result = await sweepExpiryReminders()
      console.log(`[membership-cron] checked ${result.checked} expiring membership(s), notified ${result.notified}`)
    } catch (error) {
      console.error('[membership-cron] sweep failed:', error.message)
    }
  })
  console.log(`[membership-cron] scheduled with pattern "${SCHEDULE}"`)
}

module.exports = { startMembershipCron }
