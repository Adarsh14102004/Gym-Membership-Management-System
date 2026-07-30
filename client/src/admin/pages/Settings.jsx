import { useState } from 'react'

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between border-b border-white/5 py-4 last:border-none">
    <span className="text-sm text-gray-300">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full transition-colors ${checked ? 'bg-accent-red' : 'bg-white/10'}`}
    >
      <span
        className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
)

const Settings = () => {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="mt-1 text-sm text-gray-400">Manage your dashboard preferences.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface/60 p-6">
        <Toggle label="Email notifications" checked={emailAlerts} onChange={setEmailAlerts} />
        <Toggle label="SMS notifications" checked={smsAlerts} onChange={setSmsAlerts} />
      </div>
    </div>
  )
}

export default Settings
