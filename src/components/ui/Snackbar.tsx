import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

interface SnackbarProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const colorMap = {
  success: {
    bg: 'bg-green-500/20 border-green-500/40',
    text: 'text-green-400',
    icon: 'text-green-400',
  },
  error: {
    bg: 'bg-red-500/20 border-red-500/40',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
  warning: {
    bg: 'bg-orange-500/20 border-orange-500/40',
    text: 'text-orange-400',
    icon: 'text-orange-400',
  },
  info: {
    bg: 'bg-cyan-500/20 border-cyan-500/40',
    text: 'text-cyan-400',
    icon: 'text-cyan-400',
  },
}

export default function Snackbar({ isOpen, onClose, type, message, duration = 4000 }: SnackbarProps) {
  const Icon = iconMap[type]
  const colors = colorMap[type]

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[200] max-w-md"
        >
          <div
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border
              backdrop-blur-xl shadow-2xl
              ${colors.bg}
            `}
          >
            <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0`} />
            <p className={`text-sm font-medium ${colors.text} flex-1`}>{message}</p>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
