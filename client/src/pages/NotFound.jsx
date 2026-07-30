import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFound = () => {
  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-4 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-8xl font-extrabold text-accent-red"
      >
        404
      </motion.h1>
      <p className="mt-4 text-xl font-semibold text-white">Page Not Found</p>
      <p className="mt-2 max-w-sm text-sm text-gray-400">
        Looks like this page skipped leg day. Let&apos;s get you back on track.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-accent-red px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
      >
        Back to Home
      </Link>
    </div>
  )
}

export default NotFound
