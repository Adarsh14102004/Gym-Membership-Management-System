import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <p className="text-xl font-extrabold tracking-tight text-white">
            FIT<span className="text-accent-red">ZONE</span>
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Train hard. Live strong. Your fitness journey starts here.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Explore</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/#features" className="hover:text-accent-yellow">Features</Link></li>
            <li><Link to="/#plans" className="hover:text-accent-yellow">Membership Plans</Link></li>
            <li><Link to="/#trainers" className="hover:text-accent-yellow">Trainers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Account</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/login" className="hover:text-accent-yellow">Login</Link></li>
            <li><Link to="/register" className="hover:text-accent-yellow">Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>hello@fitzone.com</li>
            <li>+1 (555) 010-2024</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} FitZone. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
