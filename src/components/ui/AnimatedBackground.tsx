import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

export default function AnimatedBackground() {
  const { theme } = useTheme()
  
  // Generate random floating elements
  const floatingElements = useMemo(() => {
    const elements: FloatingElement[] = []
    for (let i = 0; i < 30; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 60 + 20,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.15 + 0.05,
      })
    }
    return elements
  }, [])

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#020304] via-[#0a0e1a] to-[#020304]'
        : 'bg-white'
    }`}>
      {/* Animated gradient orbs */}
      <motion.div
        className={`absolute -left-40 -top-40 h-80 w-80 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-cyan-500/10' : 'bg-gradient-to-br from-pink-300/40 to-rose-400/40'
        }`}
        animate={{
          x: [0, 100, 0],
          y: [0, 150, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className={`absolute -right-40 top-1/4 h-96 w-96 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-purple-500/8' : 'bg-gradient-to-br from-blue-300/40 to-indigo-400/40'
        }`}
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className={`absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-blue-500/10' : 'bg-gradient-to-br from-teal-300/40 to-cyan-400/40'
        }`}
        animate={{
          x: [0, 120, 0],
          y: [0, -100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Light mode only: Floating colorful bubbles */}
      {theme === 'light' && (
        <>
          {/* Small bubbles */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-2xl"
            animate={{
              y: [0, -80, 0],
              x: [0, 40, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-2/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-300/35 to-orange-300/35 blur-2xl"
            animate={{
              y: [0, 60, 0],
              x: [0, -50, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 left-2/3 w-36 h-36 rounded-full bg-gradient-to-br from-green-300/30 to-emerald-300/30 blur-2xl"
            animate={{
              y: [0, -70, 0],
              x: [0, 30, 0],
              scale: [1, 1.25, 1],
            }}
            transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-blue-300/35 to-cyan-300/35 blur-2xl"
            animate={{
              y: [0, 50, 0],
              x: [0, -40, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Smaller floating particles */}
          <motion.div
            className="absolute top-1/3 right-1/3 w-20 h-20 rounded-full bg-gradient-to-br from-rose-400/40 to-red-300/40 blur-xl"
            animate={{
              y: [0, -40, 0],
              x: [0, 25, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-violet-300/35 to-purple-400/35 blur-xl"
            animate={{
              y: [0, 45, 0],
              x: [0, -30, 0],
            }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Grid pattern overlay */}
      <div 
        className={`absolute inset-0 ${
          theme === 'dark' ? 'opacity-[0.02]' : 'opacity-[0.015]'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, #00FFFF 1px, transparent 1px),
            linear-gradient(to bottom, #00FFFF 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating geometric shapes */}
      {floatingElements.map((elem) => (
        <motion.div
          key={elem.id}
          className="absolute rounded-lg"
          style={{
            left: `${elem.x}%`,
            top: `${elem.y}%`,
            width: `${elem.size}px`,
            height: `${elem.size}px`,
            background: `linear-gradient(135deg, rgba(0, 255, 255, ${elem.opacity}) 0%, rgba(138, 43, 226, ${elem.opacity * 0.5}) 100%)`,
            border: '1px solid rgba(0, 255, 255, 0.1)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: elem.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: elem.delay,
          }}
        />
      ))}

      {/* Particle dots */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute h-1 w-1 rounded-full bg-cyan-400"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Scanlines effect */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
        }}
      />

      {/* Radial gradient vignette */}
      <div className={`absolute inset-0 bg-gradient-radial from-transparent via-transparent ${
        theme === 'dark' ? 'to-black/40' : 'to-white/30'
      }`} />
    </div>
  )
}
