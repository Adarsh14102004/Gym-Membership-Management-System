import { useAuth } from '../../context/AuthContext.jsx'

const Profile = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Profile</h2>
        <p className="mt-1 text-sm text-gray-400">Your admin account details.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-red text-xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Role</p>
            <p className="mt-1 font-medium capitalize text-white">{user?.role}</p>
          </div>
          <div>
            <p className="text-gray-500">User ID</p>
            <p className="mt-1 truncate font-medium text-white">{user?._id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
