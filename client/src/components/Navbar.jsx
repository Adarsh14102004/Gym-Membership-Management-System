import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

const links = [
  { to: '/', label: 'Home' },
  { to: '/#features', label: 'Features' },
  { to: '/#plans', label: 'Plans' },
  { to: '/#trainers', label: 'Trainers' },
]

const dashboardPath = (role) => {
  if (role === 'admin') return '/admin'
  if (role === 'trainer') return '/trainer'
  if (role === 'member') return '/member'
  return '/dashboard'
}

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-base/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-white">
          FIT<span className="text-accent-red">ZONE</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.label}>
              <NavLink
                to={link.to}
                className="text-sm font-medium text-gray-300 transition-colors hover:text-accent-yellow"
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to={dashboardPath(user.role)}
                className="rounded-full px-5 py-2 text-sm font-semibold text-gray-200 transition-colors hover:text-white"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-accent-red px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-5 py-2 text-sm font-semibold text-gray-200 transition-colors hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-accent-red px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-red/30 transition-transform hover:scale-105"
              >
                Join Now
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-6 bg-white transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              {links.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-gray-300"
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="border-white/10" />
              {user ? (
                <>
                  <Link
                    to={dashboardPath(user.role)}
                    onClick={() => setOpen(false)}
                    className="text-sm font-semibold text-gray-200"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      handleLogout()
                    }}
                    className="rounded-full bg-accent-red px-5 py-2 text-center text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-semibold text-gray-200">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-accent-red px-5 py-2 text-center text-sm font-semibold text-white"
                  >
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
