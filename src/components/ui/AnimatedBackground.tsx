import { useTheme } from '@/contexts/ThemeContext'

export default function AnimatedBackground() {
  const { theme } = useTheme()

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${
      theme === 'dark' 
        ? 'bg-[#050810]'
        : 'bg-white'
    }`}>
      {/* Static subtle gradient orbs - no animation */}
      {theme === 'dark' && (
        <>
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full blur-3xl bg-cyan-500/5" />
          <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full blur-3xl bg-purple-500/5" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl bg-blue-500/5" />
        </>
      )}

      {/* Light mode subtle backgrounds */}
      {theme === 'light' && (
        <>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-2xl" />
          <div className="absolute top-2/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-300/25 to-orange-300/25 blur-2xl" />
          <div className="absolute bottom-1/4 left-2/3 w-36 h-36 rounded-full bg-gradient-to-br from-green-300/20 to-emerald-300/20 blur-2xl" />
        </>
      )}

      {/* Subtle grid pattern overlay */}
      <div 
        className={`absolute inset-0 ${
          theme === 'dark' ? 'opacity-[0.01]' : 'opacity-[0.01]'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, #00FFFF 1px, transparent 1px),
            linear-gradient(to bottom, #00FFFF 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}
