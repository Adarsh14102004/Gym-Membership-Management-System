import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

const features = [
  { title: 'Modern Equipment', desc: 'State-of-the-art machines and free weights for every training style.' },
  { title: 'Expert Trainers', desc: 'Certified coaches building custom programs around your goals.' },
  { title: 'Flexible Hours', desc: 'Open 24/7 so you can train whenever your schedule allows.' },
  { title: 'Group Classes', desc: 'HIIT, yoga, and strength classes led by energetic instructors.' },
]

const plans = [
  { name: 'Basic', price: '₹29', period: '/mo', perks: ['Gym floor access', 'Locker room', 'Free fitness assessment'] },
  { name: 'Pro', price: '₹59', period: '/mo', perks: ['Everything in Basic', 'Group classes', '2 trainer sessions/mo'], highlight: true },
  { name: 'Elite', price: '₹99', period: '/mo', perks: ['Everything in Pro', 'Unlimited trainer sessions', 'Nutrition plan'] },
]

const trainers = [
  { name: 'Alex Rivera', role: 'Strength Coach' },
  { name: 'Maya Chen', role: 'HIIT Specialist' },
  { name: 'Jordan Lee', role: 'Yoga Instructor' },
]

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 md:px-8 md:pt-32">
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-accent-red/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-accent-yellow/10 blur-3xl" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent-yellow">
            Your Transformation Starts Now
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Build The Body You <span className="text-accent-red">Deserve</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-gray-400 md:text-lg">
            Premium equipment, expert trainers, and a community that pushes you further. Join FitZone today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-accent-red px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
            >
              Get Started
            </Link>
            <a
              href="#plans"
              className="rounded-full border border-white/15 px-8 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-accent-yellow hover:text-accent-yellow"
            >
              View Plans
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-white md:text-4xl"
        >
          Why Train With Us
        </motion.h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-surface/60 p-6 backdrop-blur-sm transition-colors hover:border-accent-red/40"
            >
              <div className="mb-4 h-10 w-10 rounded-lg bg-accent-yellow/15" />
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Membership Plans */}
      <section id="plans" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-white md:text-4xl"
        >
          Membership Plans
        </motion.h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-8 ${
                plan.highlight
                  ? 'border-accent-red bg-gradient-to-b from-accent-red/10 to-surface shadow-xl shadow-accent-red/10'
                  : 'border-white/10 bg-surface/60'
              }`}
            >
              {plan.highlight && (
                <span className="rounded-full bg-accent-red px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="mt-4 text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2 text-4xl font-extrabold text-white">
                {plan.price}<span className="text-base font-medium text-gray-400">{plan.period}</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`mt-8 block rounded-full px-6 py-3 text-center text-sm font-semibold transition-transform hover:scale-105 ${
                  plan.highlight ? 'bg-accent-red text-white' : 'bg-white/10 text-white'
                }`}
              >
                Choose {plan.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trainers Preview */}
      <section id="trainers" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-white md:text-4xl"
        >
          Meet Our Trainers
        </motion.h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {trainers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-surface/60 p-6 text-center backdrop-blur-sm"
            >
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-accent-red/40 to-accent-yellow/30" />
              <h3 className="mt-4 text-lg font-semibold text-white">{t.name}</h3>
              <p className="text-sm text-gray-400">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-r from-accent-red/20 via-surface to-accent-yellow/10 p-10 text-center md:p-16"
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">Ready To Start Your Journey?</h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-300">
            Join thousands of members who transformed their lives with FitZone.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-full bg-accent-yellow px-8 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
          >
            Join FitZone Today
          </Link>
        </motion.div>
      </section>
    </div>
  )
}

export default Home
