import { motion, AnimatePresence } from 'framer-motion'

interface LoadingOverlayProps {
  isVisible: boolean
  text?: string
}

export default function LoadingOverlay({ isVisible, text = 'Loading...' }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-3xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative flex w-[min(90vw,22rem)] flex-col items-center gap-4 rounded-[32px] border border-white/10 bg-white/15 p-8 text-center shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl dark:bg-slate-900/60"
          >
            <motion.img
              src="/logo.jpeg"
              alt="PlayNex logo"
              className="h-20 w-20 rounded-2xl object-cover shadow-lg shadow-cyan-500/30"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            />

            <div className="w-full space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-100/70">Preparing experience</p>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.span
                  className="absolute inset-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                  animate={{ x: ['-120%', '180%'] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base font-semibold text-cyan-50"
              >
                {text}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
