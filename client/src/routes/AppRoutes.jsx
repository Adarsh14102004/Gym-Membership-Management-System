import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import NotFound from '../pages/NotFound.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import AdminLayout from '../admin/layouts/AdminLayout.jsx'
import DashboardHome from '../admin/pages/DashboardHome.jsx'
import Members from '../admin/pages/Members.jsx'
import Trainers from '../admin/pages/Trainers.jsx'
import Plans from '../admin/pages/Plans.jsx'
import AdminClasses from '../admin/pages/Classes.jsx'
import AdminMembership from '../admin/pages/Membership.jsx'
import AdminAttendance from '../admin/pages/Attendance.jsx'
import Profile from '../admin/pages/Profile.jsx'
import Settings from '../admin/pages/Settings.jsx'
import TrainerLayout from '../trainer/layouts/TrainerLayout.jsx'
import TrainerDashboard from '../trainer/pages/Dashboard.jsx'
import MyMembers from '../trainer/pages/MyMembers.jsx'
import MyClasses from '../trainer/pages/MyClasses.jsx'
import MemberAttendance from '../trainer/pages/MemberAttendance.jsx'
import ExerciseLibrary from '../trainer/pages/ExerciseLibrary.jsx'
import WorkoutPlans from '../trainer/pages/WorkoutPlans.jsx'
import DietPlans from '../trainer/pages/DietPlans.jsx'
import Videos from '../trainer/pages/Videos.jsx'
import ProgressApproval from '../trainer/pages/ProgressApproval.jsx'
import Chat from '../trainer/pages/Chat.jsx'
import MemberLayout from '../member/layouts/MemberLayout.jsx'
import MemberDashboard from '../member/pages/Dashboard.jsx'
import MyMembership from '../member/pages/MyMembership.jsx'
import Attendance from '../member/pages/Attendance.jsx'
import MemberWorkoutPlan from '../member/pages/WorkoutPlan.jsx'
import MemberDietPlan from '../member/pages/DietPlan.jsx'
import ClassSchedule from '../member/pages/ClassSchedule.jsx'
import MyBookings from '../member/pages/MyBookings.jsx'
import MemberProgress from '../member/pages/Progress.jsx'
import Notifications from '../member/pages/Notifications.jsx'
import MemberProfile from '../member/pages/Profile.jsx'
import MemberSettings from '../member/pages/Settings.jsx'

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="members" element={<Members />} />
        <Route path="trainers" element={<Trainers />} />
        <Route path="plans" element={<Plans />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="membership" element={<AdminMembership />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="/trainer"
        element={
          <ProtectedRoute roles={['trainer']}>
            <TrainerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TrainerDashboard />} />
        <Route path="members" element={<MyMembers />} />
        <Route path="classes" element={<MyClasses />} />
        <Route path="attendance" element={<MemberAttendance />} />
        <Route path="exercises" element={<ExerciseLibrary />} />
        <Route path="workout-plans" element={<WorkoutPlans />} />
        <Route path="diet-plans" element={<DietPlans />} />
        <Route path="videos" element={<Videos />} />
        <Route path="progress" element={<ProgressApproval />} />
        <Route path="chat" element={<Chat />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="/member"
        element={
          <ProtectedRoute roles={['member']}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberDashboard />} />
        <Route path="membership" element={<MyMembership />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="classes" element={<ClassSchedule />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="workout-plan" element={<MemberWorkoutPlan />} />
        <Route path="diet-plan" element={<MemberDietPlan />} />
        <Route path="progress" element={<MemberProgress />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<MemberProfile />} />
        <Route path="settings" element={<MemberSettings />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
