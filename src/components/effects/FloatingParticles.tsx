import { motion } from 'framer-motion'

export default function FloatingParticles({ count = 30 }: { count?: number }) {
  // Generate static particle data outside of render
  const particleIndices = Array.from({ length: count }, (_, i) => i)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particleIndices.map((i) => {
        // Use index-based deterministic values for stable rendering
        const x = ((i * 37) % 100)
        const y = ((i * 73) % 100)
        const size = 2 + ((i * 11) % 4)
        const duration = 15 + ((i * 13) % 10)
        const delay = (i * 5) % 5
        const xOffset = ((i * 17) % 20) - 10

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-400/30 blur-sm"
            style={{
              width: size,
              height: size,
              left: `${x}%`,
              top: `${y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, xOffset, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )
      })}
    </div>
  )
}
