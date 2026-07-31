import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import Loader from '../components/Loader.jsx'
import AdminLayout from '../admin/layouts/AdminLayout.jsx'
import TrainerLayout from '../trainer/layouts/TrainerLayout.jsx'
import MemberLayout from '../member/layouts/MemberLayout.jsx'

const Home = lazy(() => import('../pages/Home.jsx'))
const Login = lazy(() => import('../pages/Login.jsx'))
const Register = lazy(() => import('../pages/Register.jsx'))
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'))
const NotFound = lazy(() => import('../pages/NotFound.jsx'))

const DashboardHome = lazy(() => import('../admin/pages/DashboardHome.jsx'))
const Members = lazy(() => import('../admin/pages/Members.jsx'))
const Trainers = lazy(() => import('../admin/pages/Trainers.jsx'))
const Plans = lazy(() => import('../admin/pages/Plans.jsx'))
const AdminClasses = lazy(() => import('../admin/pages/Classes.jsx'))
const AdminMembership = lazy(() => import('../admin/pages/Membership.jsx'))
const AdminAttendance = lazy(() => import('../admin/pages/Attendance.jsx'))
const Analytics = lazy(() => import('../admin/pages/Analytics.jsx'))
const Reports = lazy(() => import('../admin/pages/Reports.jsx'))
const Profile = lazy(() => import('../admin/pages/Profile.jsx'))
const Settings = lazy(() => import('../admin/pages/Settings.jsx'))

const TrainerDashboard = lazy(() => import('../trainer/pages/Dashboard.jsx'))
const MyMembers = lazy(() => import('../trainer/pages/MyMembers.jsx'))
const MyClasses = lazy(() => import('../trainer/pages/MyClasses.jsx'))
const MemberAttendance = lazy(() => import('../trainer/pages/MemberAttendance.jsx'))
const ExerciseLibrary = lazy(() => import('../trainer/pages/ExerciseLibrary.jsx'))
const WorkoutPlans = lazy(() => import('../trainer/pages/WorkoutPlans.jsx'))
const DietPlans = lazy(() => import('../trainer/pages/DietPlans.jsx'))
const Videos = lazy(() => import('../trainer/pages/Videos.jsx'))
const ProgressApproval = lazy(() => import('../trainer/pages/ProgressApproval.jsx'))
const MemberUpdates = lazy(() => import('../trainer/pages/MemberUpdates.jsx'))
const Chat = lazy(() => import('../trainer/pages/Chat.jsx'))

const MemberDashboard = lazy(() => import('../member/pages/Dashboard.jsx'))
const MyMembership = lazy(() => import('../member/pages/MyMembership.jsx'))
const Payment = lazy(() => import('../member/pages/Payment.jsx'))
const PaymentSuccess = lazy(() => import('../member/pages/PaymentSuccess.jsx'))
const PaymentHistory = lazy(() => import('../member/pages/PaymentHistory.jsx'))
const Attendance = lazy(() => import('../member/pages/Attendance.jsx'))
const MemberWorkoutPlan = lazy(() => import('../member/pages/WorkoutPlan.jsx'))
const MemberDietPlan = lazy(() => import('../member/pages/DietPlan.jsx'))
const ClassSchedule = lazy(() => import('../member/pages/ClassSchedule.jsx'))
const MyBookings = lazy(() => import('../member/pages/MyBookings.jsx'))
const MemberProgress = lazy(() => import('../member/pages/Progress.jsx'))
const MemberChat = lazy(() => import('../member/pages/Chat.jsx'))
const AIAssistant = lazy(() => import('../member/pages/AIAssistant.jsx'))
const Notifications = lazy(() => import('../member/pages/Notifications.jsx'))
const MemberProfile = lazy(() => import('../member/pages/Profile.jsx'))
const MemberSettings = lazy(() => import('../member/pages/Settings.jsx'))

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
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
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
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
          <Route path="updates" element={<MemberUpdates />} />
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
          <Route path="payment" element={<Payment />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="classes" element={<ClassSchedule />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="workout-plan" element={<MemberWorkoutPlan />} />
          <Route path="diet-plan" element={<MemberDietPlan />} />
          <Route path="progress" element={<MemberProgress />} />
          <Route path="chat" element={<MemberChat />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="settings" element={<MemberSettings />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
