const ProgressLog = require('../models/ProgressLog')
const DietPlan = require('../models/DietPlan')
const WorkoutPlan = require('../models/WorkoutPlan')
const { getMembershipSummary } = require('./membershipController')

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const todayDayName = () => DAYS[new Date().getDay()]

const bmiCategory = (bmi) => {
  if (bmi == null) return null
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

const CATEGORIES = [
  { key: 'membership', keywords: ['membership', 'subscription', 'renew', 'expire', 'payment', 'pay', 'plan cost', 'my plan'] },
  { key: 'bmi', keywords: ['bmi', 'body mass', 'overweight', 'underweight', 'obese', 'healthy weight'] },
  { key: 'diet', keywords: ['diet', 'meal', 'food', 'eat', 'nutrition', 'calorie', 'protein', 'carb'] },
  {
    key: 'workout',
    keywords: ['workout', 'work out', 'working out', 'exercise', 'training', 'routine', 'cardio', 'strength', 'gym session', 'gym today'],
  },
  { key: 'thanks', keywords: ['thank', 'thanks', 'appreciate'] },
  { key: 'goodbye', keywords: ['bye', 'goodbye', 'see you'] },
  { key: 'greeting', keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon'] },
]

const matchCategory = (message) => {
  const msg = message.toLowerCase()
  for (const { key, keywords } of CATEGORIES) {
    if (keywords.some((k) => msg.includes(k))) return key
  }
  return 'fallback'
}

const buildReply = async (category, memberId) => {
  switch (category) {
    case 'greeting':
      return "Hey there! I'm your fitness assistant. Ask me about workouts, diet, BMI, or your membership."

    case 'thanks':
      return "You're welcome! Keep pushing towards your goals."

    case 'goodbye':
      return 'See you at the gym! Stay consistent.'

    case 'membership': {
      const summary = await getMembershipSummary(memberId)
      if (!summary.planName) {
        return "You don't have an active membership plan yet. Head to the Payment page to choose one."
      }
      if (summary.status !== 'active') {
        return `Your ${summary.planName} plan is currently ${summary.status}. Renew from the Payment page to keep training with us.`
      }
      return `You're on the ${summary.planName} plan, active with ${summary.daysRemaining} day(s) remaining (expires ${new Date(
        summary.expiryDate
      ).toLocaleDateString()}).`
    }

    case 'bmi': {
      const latest = await ProgressLog.findOne({ member: memberId }).sort({ createdAt: -1 })
      if (!latest?.bmi) {
        return 'Log your weight and height on the Progress page and I can tell you your BMI category.'
      }
      const category2 = bmiCategory(latest.bmi)
      const tips = {
        Underweight: 'Focus on a calorie surplus with protein-rich meals and strength training.',
        Normal: "Great job! Maintain your current routine with balanced diet and regular workouts.",
        Overweight: 'A mix of cardio, strength training and a moderate calorie deficit can help.',
        Obese: 'Start with low-impact cardio and consult your trainer for a tailored plan.',
      }
      return `Your latest BMI is ${latest.bmi} (${category2}). ${tips[category2] || ''}`
    }

    case 'diet': {
      const plan = await DietPlan.findOne({ member: memberId, status: 'active' }).sort({ createdAt: -1 })
      if (plan) {
        return `Your active diet plan "${plan.title}" includes: ${plan.meals?.slice(0, 4).join(', ') || 'meals set by your trainer'}. Stay hydrated and eat consistently!`
      }
      return "You don't have a diet plan assigned yet. In general: eat lean protein, plenty of vegetables, whole grains, and stay hydrated."
    }

    case 'workout': {
      const plan = await WorkoutPlan.findOne({ member: memberId, day: todayDayName(), status: 'active' })
      if (plan) {
        return `Today (${todayDayName()}) you have "${plan.title}" scheduled${plan.duration ? ` (~${plan.duration} min)` : ''}. Check the Workout Plan page for the full exercise list.`
      }
      return `No workout is scheduled for you today (${todayDayName()}). A good default: 20-30 min cardio plus bodyweight strength exercises.`
    }

    default:
      return "I can help with workout, diet, BMI, or membership questions. Try asking something like 'What's my BMI?' or 'Am I working out today?'"
  }
}

const ruleBasedChat = async (req, res, next) => {
  try {
    const { message } = req.body
    if (!message || !message.trim()) {
      res.status(400)
      throw new Error('Message is required')
    }

    const category = matchCategory(message)
    const reply = await buildReply(category, req.user._id)

    res.json({ reply, category })
  } catch (error) {
    next(error)
  }
}

module.exports = { ruleBasedChat }
