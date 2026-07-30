import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const Topbar = ({ onMenuClick, title = 'Admin Dashboard' }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-base/80 px-4 py-4 backdrop-blur-md md:px-8">
      <button type="button" onClick={onMenuClick} className="flex flex-col gap-1.5 p-2 md:hidden" aria-label="Toggle menu">
        <span className="h-0.5 w-6 bg-white" />
        <span className="h-0.5 w-6 bg-white" />
        <span className="h-0.5 w-6 bg-white" />
      </button>

      <h1 className="hidden text-lg font-bold text-white md:block">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-red text-sm font-bold text-white">
            {initials}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs capitalize text-gray-400">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-accent-red px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Topbar
