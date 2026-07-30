import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '../../admin/components/Sidebar.jsx'
import Topbar from '../../admin/components/Topbar.jsx'
import Toast from '../../components/Toast.jsx'

const links = [
  { to: '/trainer', label: 'Dashboard', end: true },
  { to: '/trainer/members', label: 'My Members' },
  { to: '/trainer/classes', label: 'My Classes' },
  { to: '/trainer/attendance', label: 'Member Attendance' },
  { to: '/trainer/exercises', label: 'Exercise Library' },
  { to: '/trainer/workout-plans', label: 'Workout Plans' },
  { to: '/trainer/diet-plans', label: 'Diet Plans' },
  { to: '/trainer/videos', label: 'Videos' },
  { to: '/trainer/progress', label: 'Progress Approval' },
  { to: '/trainer/chat', label: 'Chat' },
  { to: '/trainer/profile', label: 'Profile' },
  { to: '/trainer/settings', label: 'Settings' },
]

const TrainerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} links={links} subtitle="Trainer Panel" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title="Trainer Dashboard" />
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

export default TrainerLayout
