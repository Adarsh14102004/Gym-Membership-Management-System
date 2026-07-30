import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const Sidebar = ({ open, onClose, links, subtitle = 'Admin Panel' }) => {
  const content = (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-surface px-4 py-6">
      <p className="px-2 text-xl font-extrabold tracking-tight text-white">
        FIT<span className="text-accent-red">ZONE</span>
      </p>
      <p className="mb-8 px-2 text-xs uppercase tracking-widest text-gray-500">{subtitle}</p>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onClose}
            className={({ isActive }) =>
              `rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-accent-red text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )

  return (
    <>
      <div className="hidden md:block">{content}</div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
