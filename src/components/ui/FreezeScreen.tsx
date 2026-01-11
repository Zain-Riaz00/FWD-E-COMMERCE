import { motion } from 'framer-motion'
import { Lock, ArrowRight } from 'lucide-react'

interface FreezeScreenProps {
  message: string
  onAdminBypass?: () => void
  showAdminBypass?: boolean
}

export default function FreezeScreen({ message, onAdminBypass, showAdminBypass }: FreezeScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-900/95 via-black to-pink-900/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-4 text-center"
      >
        {/* Lock Icon */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-8 inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 ring-4 ring-red-500/30"
        >
          <Lock className="w-16 h-16 text-red-300" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-200 via-orange-200 to-red-200 bg-clip-text text-transparent"
        >
          Website Under Maintenance
        </motion.h1>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-8 bg-black/40 rounded-2xl ring-1 ring-red-500/20"
        >
          <p className="text-xl md:text-2xl font-semibold text-red-100 leading-relaxed">
            {message}
          </p>
        </motion.div>

        {/* Sub Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-red-200/70 mb-8"
        >
          We apologize for the inconvenience. Please check back later.
        </motion.p>

        {/* Animated Pulse */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="inline-block px-6 py-3 bg-red-500/10 rounded-full ring-1 ring-red-400/30"
        >
          <span className="text-sm font-medium text-red-300">
            ⏳ Temporarily Unavailable
          </span>
        </motion.div>

        {/* Admin Bypass Button */}
        {showAdminBypass && onAdminBypass && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onAdminBypass}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-xl font-medium ring-1 ring-purple-400/40 transition-all group"
          >
            <span>Admin Access</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
