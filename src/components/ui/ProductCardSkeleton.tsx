// Simple loading skeleton - no animations
export default function ProductCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl"
        >
          {/* Image Skeleton */}
          <div className="relative aspect-square overflow-hidden bg-zinc-800/50" />

          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-5 bg-zinc-700/50 rounded" style={{ width: '80%' }} />
            
            {/* Rating */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-3.5 w-3.5 bg-zinc-700/50 rounded" />
              ))}
            </div>

            {/* Price */}
            <div className="flex items-end justify-between">
              <div className="h-8 bg-zinc-700/50 rounded" style={{ width: '40%' }} />
              <div className="h-8 w-8 bg-zinc-700/50 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
