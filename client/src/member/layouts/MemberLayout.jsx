import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '../../admin/components/Sidebar.jsx'
import Topbar from '../../admin/components/Topbar.jsx'
import Toast from '../../components/Toast.jsx'

const links = [
  { to: '/member', label: 'Dashboard', end: true },
  { to: '/member/membership', label: 'My Membership' },
  { to: '/member/attendance', label: 'Attendance' },
  { to: '/member/classes', label: 'Class Schedule' },
  { to: '/member/bookings', label: 'My Bookings' },
  { to: '/member/workout-plan', label: 'Workout Plan' },
  { to: '/member/diet-plan', label: 'Diet Plan' },
  { to: '/member/progress', label: 'Progress' },
  { to: '/member/notifications', label: 'Notifications' },
  { to: '/member/profile', label: 'Profile' },
  { to: '/member/settings', label: 'Settings' },
]

const MemberLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} links={links} subtitle="Member Panel" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title="Member Dashboard" />
        <main className="flex-1 px-4 py-6 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toast />
    </div>
  )
}

export default MemberLayout
