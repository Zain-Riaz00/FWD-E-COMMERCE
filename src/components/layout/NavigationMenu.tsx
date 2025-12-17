import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, Package, ShoppingCart, User, LogOut, Bell } from 'lucide-react'

export default function NavigationMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/profile', label: 'Profile', icon: User },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-[60] w-72 bg-gradient-to-br from-[#0a0e1a]/95 to-[#020304]/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-400/20"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/20 transition-all hover:bg-cyan-500/20 hover:text-cyan-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex h-full flex-col p-6 pt-20">
                {/* Menu Title */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    Navigation
                  </h2>
                  <p className="mt-1 text-sm text-cyan-200/60">Quick access to all pages</p>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.path)
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`group flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                          active
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-400/40 shadow-lg shadow-cyan-500/10'
                            : 'hover:bg-cyan-500/10 hover:ring-1 hover:ring-cyan-400/20'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${active ? 'text-cyan-400' : 'text-cyan-300/70 group-hover:text-cyan-300'}`} />
                        <span className={`font-medium ${active ? 'text-cyan-100' : 'text-cyan-200/70 group-hover:text-cyan-200'}`}>
                          {item.label}
                        </span>
                        {active && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
                          />
                        )}
                      </Link>
                    )
                  })}
                </nav>

                {/* Footer with Sign Out */}
                <div className="mt-auto space-y-3">
                  <button
                    onClick={() => {
                      console.log('Signing out...')
                      onClose()
                      navigate('/auth')
                    }}
                    className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-red-400 hover:bg-red-500/10 hover:ring-1 hover:ring-red-400/20 transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                  <div className="pt-3 border-t border-cyan-400/10">
                    <p className="text-xs text-cyan-200/50 text-center">
                      E-Commerce Store
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
