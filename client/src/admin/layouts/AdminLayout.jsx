import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import Toast from '../../components/Toast.jsx'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/members', label: 'Members' },
  { to: '/admin/trainers', label: 'Trainers' },
  { to: '/admin/plans', label: 'Membership Plans' },
  { to: '/admin/classes', label: 'Classes' },
  { to: '/admin/membership', label: 'Membership' },
  { to: '/admin/attendance', label: 'Attendance' },
  { to: '/admin/profile', label: 'Profile' },
  { to: '/admin/settings', label: 'Settings' },
]

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} links={links} subtitle="Admin Panel" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title="Admin Dashboard" />
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

export default AdminLayout
