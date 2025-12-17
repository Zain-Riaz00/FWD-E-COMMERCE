import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface GlassShatterEffectProps {
  onComplete: () => void
  centerX?: number
  centerY?: number
}

export default function GlassShatterEffect({ 
  onComplete, 
  centerX = 50, 
  centerY = 50 
}: GlassShatterEffectProps) {
  const { theme } = useTheme()
  const [shards, setShards] = useState<Array<{
    id: number
    x: number
    y: number
    width: number
    height: number
    rotation: number
    velocityX: number
    velocityY: number
  }>>([])

  useEffect(() => {
    // Generate random glass shards
    const numShards = 20
    const newShards = Array.from({ length: numShards }, (_, i) => {
      const angle = (Math.PI * 2 * i) / numShards + (Math.random() - 0.5) * 0.5
      const velocity = 3 + Math.random() * 4
      
      return {
        id: i,
        x: centerX + (Math.random() - 0.5) * 20,
        y: centerY + (Math.random() - 0.5) * 20,
        width: 30 + Math.random() * 40,
        height: 30 + Math.random() * 40,
        rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity,
      }
    })
    
    setShards(newShards)

    // Complete after animation
    const timer = setTimeout(onComplete, 1000)
    return () => clearTimeout(timer)
  }, [centerX, centerY, onComplete])

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {/* Flash effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 ${theme === 'dark' ? 'bg-cyan-400/30' : 'bg-white/80'}`}
      />

      {/* Glass shards */}
      {shards.map((shard) => (
        <motion.div
          key={shard.id}
          initial={{
            x: `${shard.x}%`,
            y: `${shard.y}%`,
            opacity: 1,
            rotate: shard.rotation,
            scale: 1,
          }}
          animate={{
            x: `${shard.x + shard.velocityX * 15}%`,
            y: `${shard.y + shard.velocityY * 15}%`,
            opacity: 0,
            rotate: shard.rotation + shard.velocityX * 100,
            scale: 0.3,
          }}
          transition={{
            duration: 0.8,
            ease: [0.36, 0, 0.66, -0.56],
          }}
          className="absolute"
          style={{
            width: shard.width,
            height: shard.height,
          }}
        >
          {/* Triangular glass shard */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            className={theme === 'dark' ? 'drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]'}
          >
            <polygon
              points="50,10 90,90 10,90"
              fill={theme === 'dark' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.6)'}
              stroke={theme === 'dark' ? 'rgba(6, 182, 212, 0.8)' : 'rgba(37, 99, 235, 0.8)'}
              strokeWidth="2"
              className="animate-pulse"
            />
            <polygon
              points="50,10 90,90 10,90"
              fill={`url(#glassGradient-${theme})`}
              opacity="0.6"
            />
            <defs>
              <linearGradient id={`glassGradient-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
                {theme === 'dark' ? (
                  <>
                    <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                    <stop offset="50%" stopColor="rgba(6,182,212,0.4)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.2)" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                    <stop offset="50%" stopColor="rgba(37,99,235,0.6)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.4)" />
                  </>
                )}
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}

      {/* Sound effect text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
        transition={{ duration: 0.6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <span className={`text-6xl font-bold ${theme === 'dark' ? 'text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,1)]' : 'text-blue-600 drop-shadow-[0_0_20px_rgba(37,99,235,1)]'}`}>
          💥
        </span>
      </motion.div>
    </div>
  )
}
