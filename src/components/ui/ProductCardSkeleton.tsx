import { motion } from 'framer-motion'

export default function ProductCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl"
        >
          {/* Image Skeleton */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-900/50 to-zinc-950/50">
            <div className="absolute inset-0 shimmer" />
          </div>

          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-5 bg-zinc-800/50 rounded shimmer" style={{ width: '80%' }} />
            
            {/* Rating */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-3.5 w-3.5 bg-zinc-800/50 rounded shimmer" />
              ))}
            </div>

            {/* Price */}
            <div className="flex items-end justify-between">
              <div className="h-8 bg-zinc-800/50 rounded shimmer" style={{ width: '40%' }} />
              <div className="h-8 w-8 bg-zinc-800/50 rounded-lg shimmer" />
            </div>
          </div>
        </motion.div>
      ))}

      <style>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(6, 182, 212, 0.1) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  )
}
