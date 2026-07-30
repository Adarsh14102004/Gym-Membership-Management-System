import { motion } from 'framer-motion'

const Loader = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <motion.div
        className="h-10 w-10 rounded-full border-4 border-white/10 border-t-accent-red"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
    </div>
  )
}

export default Loader
