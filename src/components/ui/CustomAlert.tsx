import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface CustomAlertProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error'
  message: string
}

export default function CustomAlert({ isOpen, onClose, type, message }: CustomAlertProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="backdrop-blur-xl bg-slate-900/90 p-6 rounded-2xl border border-white/20 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                type === 'success' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {type === 'success' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {type === 'success' ? 'Success' : 'Error'}
                </h3>
                <p className="text-white/80 text-sm">{message}</p>
              </div>

              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                  type === 'success'
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                }`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
