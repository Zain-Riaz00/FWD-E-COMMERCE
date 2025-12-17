import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const colors = {
    danger: {
      icon: 'text-red-400',
      iconBg: 'bg-red-500/20',
      confirmBtn: 'bg-red-500/30 text-red-100 ring-red-400/50 hover:bg-red-500/40',
    },
    warning: {
      icon: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20',
      confirmBtn: 'bg-yellow-500/30 text-yellow-100 ring-yellow-400/50 hover:bg-yellow-500/40',
    },
    info: {
      icon: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20',
      confirmBtn: 'bg-cyan-500/30 text-cyan-100 ring-cyan-400/50 hover:bg-cyan-500/40',
    },
  }

  const style = colors[variant]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] pointer-events-none"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, x: 100, y: 100 }}
          animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, x: 100, y: 100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/20 ring-2 ring-cyan-400/30"
        >
          {/* Content */}
          <div className="p-5">
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute right-3 top-3 rounded-lg p-1 text-cyan-400/70 transition hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Icon and Title */}
            <div className="flex items-start gap-3 mb-3">
              <div className={`flex-shrink-0 rounded-full p-2 ${style.iconBg}`}>
                <AlertTriangle className={`h-5 w-5 ${style.icon}`} />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-base font-bold text-cyan-100 mb-1">{title}</h3>
                <p className="text-sm text-cyan-200/70 leading-relaxed">{message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={onCancel}
                className="flex-1 px-3 py-2 text-sm border border-cyan-400/30 rounded-lg text-cyan-100 hover:bg-white/5 transition-all font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  onCancel()
                }}
                className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-all ring-1 ring-inset ${style.confirmBtn}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
