import Modal from './Modal.jsx'

const ConfirmDialog = ({
  open,
  title = 'Confirm Delete',
  message,
  onCancel,
  onConfirm,
  loading,
  confirmLabel = 'Delete',
  loadingLabel = 'Deleting...',
  tone = 'red',
}) => {
  const toneClass = tone === 'yellow' ? 'bg-accent-yellow text-base' : 'bg-accent-red text-white'

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-gray-400">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-gray-300 transition-colors hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 ${toneClass}`}
        >
          {loading ? loadingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
