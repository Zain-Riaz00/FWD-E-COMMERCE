interface LoadingOverlayProps {
  isVisible: boolean
  text?: string
}

// Minimal loading overlay - no animations for better performance
export default function LoadingOverlay({ isVisible, text = 'Loading...' }: LoadingOverlayProps) {
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90">
      <div className="relative flex w-[min(90vw,22rem)] flex-col items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-center">
        <img
          src="/logo.jpeg"
          alt="PlayNex logo"
          className="h-16 w-16 rounded-xl object-cover"
        />
        <p className="text-base font-medium text-cyan-50">{text}</p>
      </div>
    </div>
  )
}
