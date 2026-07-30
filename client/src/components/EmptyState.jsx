const EmptyState = ({ title = 'Nothing here yet', message, action }) => (
  <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
    <p className="text-sm font-semibold text-white">{title}</p>
    {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export default EmptyState
