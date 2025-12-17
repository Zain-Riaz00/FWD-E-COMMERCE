import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  isVisible: boolean
  text?: string
}

export default function GalleryLoadingOverlay({ isVisible, text = 'Loading...' }: Props) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#020304] via-[#0a0e1a] to-[#020304]"
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full" style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}>
              <motion.div
                className="h-full w-full"
                animate={{
                  backgroundPosition: ['0px 0px', '50px 50px'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px',
                }}
              />
            </div>
          </div>

          {/* Central loading animation */}
          <div className="relative flex flex-col items-center gap-8">
            {/* Rotating 3D cube wireframe */}
            <div className="relative h-32 w-32">
              {/* Front face */}
              <motion.div
                className="absolute inset-0 border-2 border-cyan-400/60"
                animate={{
                  rotateY: [0, 360],
                  rotateX: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
                }}
              />
              
              {/* Diagonal lines */}
              <motion.div
                className="absolute left-0 top-0 h-full w-full"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <div className="h-full w-full border-2 border-purple-400/40" style={{ transform: 'rotateY(45deg) rotateX(45deg)' }} />
              </motion.div>

              {/* Inner cube */}
              <motion.div
                className="absolute inset-4 border-2 border-blue-400/50"
                animate={{
                  rotateY: [360, 0],
                  rotateX: [360, 0],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
                }}
              />

              {/* Corner dots */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full bg-cyan-400"
                  style={{
                    top: i < 2 ? '0' : 'auto',
                    bottom: i >= 2 ? '0' : 'auto',
                    left: i % 2 === 0 ? '0' : 'auto',
                    right: i % 2 === 1 ? '0' : 'auto',
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Loading text */}
            <motion.div
              className="text-center"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <p className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                {text}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-cyan-400"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Scanning lines */}
            <motion.div
              className="absolute inset-0 overflow-hidden"
              style={{ pointerEvents: 'none' }}
            >
              <motion.div
                className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                animate={{
                  y: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
