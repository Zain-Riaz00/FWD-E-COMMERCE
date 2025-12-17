import { ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

interface VerifiedBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function VerifiedBadge({ 
  className = '', 
  size = 'md',
  showLabel = false 
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const containerSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ 
        scale: 1.1,
        rotate: [0, -10, 10, -10, 0],
        transition: { duration: 0.5 }
      }}
      className={`inline-flex items-center gap-1 ${containerSizes[size]} ${className}`}
      title="Verified Account"
    >
      <div className="relative">
        <ShieldCheck 
          className={`${sizeClasses[size]} text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]`}
          fill="currentColor"
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            boxShadow: [
              '0 0 8px rgba(34,211,238,0.4)',
              '0 0 16px rgba(34,211,238,0.6)',
              '0 0 8px rgba(34,211,238,0.4)',
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            borderRadius: '50%'
          }}
        />
      </div>
      {showLabel && (
        <span className="font-semibold text-cyan-400">
          Verified
        </span>
      )}
    </motion.div>
  )
}
