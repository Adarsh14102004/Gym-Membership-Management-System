import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../context/ToastContext.jsx'

const styles = {
  success: 'border-accent-yellow/40 text-accent-yellow',
  error: 'border-accent-red/40 text-accent-red',
  info: 'border-white/10 text-white',
}

const Toast = () => {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-72 flex-col-reverse gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={`rounded-xl border bg-surface px-4 py-3 text-sm font-medium shadow-lg ${styles[t.type] || styles.info}`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default Toast
