import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={className || "fixed top-20 right-4 z-40 p-2 rounded-full backdrop-blur-md ring-1 transition-all shadow-lg border dark:bg-cyan-500/20 dark:border-cyan-400/30 dark:ring-cyan-400/40 dark:hover:ring-cyan-400/60 dark:shadow-cyan-500/20 bg-white/40 border-white/10 ring-blue-400/70 hover:ring-blue-500 shadow-blue-500/30 hover:bg-white/50"}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait">
        {theme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-4 h-4 text-amber-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-4 h-4 text-blue-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

