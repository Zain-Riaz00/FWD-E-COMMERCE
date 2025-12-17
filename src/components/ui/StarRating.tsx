// No runtime React usage needed; relying on JSX transform

interface StarRatingProps {
  value: number // 0-5
  max?: number
  className?: string
}

export function StarRating({ value, max = 5, className }: StarRatingProps) {
  const pct = Math.max(0, Math.min(value, max)) / max * 100
  return (
    <div
      className={"relative inline-flex items-center" + (className ? " " + className : "")}
      aria-label={`Rating: ${value.toFixed(1)} out of ${max}`}
    >
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => (
          <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5 text-zinc-600">
            <path
              fill="currentColor"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
        ))}
      </div>
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <div className="flex">
          {Array.from({ length: max }).map((_, i) => (
            <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5 text-indigo-400 dark:text-indigo-400 text-yellow-500">
              <path
                fill="currentColor"
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}
