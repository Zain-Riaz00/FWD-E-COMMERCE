import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface GuestRestrictionModalProps {
  isOpen: boolean
  onClose: () => void
  action: string
}

export default function GuestRestrictionModal({ isOpen, onClose, action }: GuestRestrictionModalProps) {
  const navigate = useNavigate()

  const handleLogin = () => {
    onClose()
    navigate('/auth')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl ring-1 ring-white/20 dark:ring-gray-700/50 border border-white/10 dark:border-gray-700/50">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <LogIn className="w-8 h-8 text-cyan-500" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2">
                Sign In Required
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                To {action}, please sign in or create an account
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogin}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:scale-[1.02]"
                >
                  Sign In / Sign Up
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
