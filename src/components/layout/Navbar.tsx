import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, Shield, LogOut, Bell, Heart, Package } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAdmin } from '@/contexts/AdminContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { GLOBAL_NOTIFICATION_KEY, loadGlobalNotifications } from '@/utils/notificationFeed'
import { getUserStatus } from '@/utils/guestUser'
import GuestRestrictionModal from '@/components/ui/GuestRestrictionModal'

export default function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { totalQuantity } = useCart()
  const { isAdmin, logout } = useAdmin()
  const { items: wishlistItems } = useWishlist()
  const [allProducts, setAllProducts] = useState<{ name: string; description?: string; category?: string }[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const userStatus = getUserStatus()

  useEffect(() => {
    // Fetch products for suggestions
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => console.error('Failed to fetch products:', err))
  }, [])

  useEffect(() => {
    const refreshNotifications = () => {
      const feed = loadGlobalNotifications()
      const unread = feed.filter(entry => entry.status === 'new').length
      setNotificationCount(unread)
    }

    refreshNotifications()

    if (typeof window === 'undefined') return

    const handleStorage = (event: StorageEvent) => {
      if (event.key === GLOBAL_NOTIFICATION_KEY) {
        refreshNotifications()
      }
    }

    const handleCustom = () => refreshNotifications()

    window.addEventListener('storage', handleStorage)
    window.addEventListener('global-notifications-update', handleCustom)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('global-notifications-update', handleCustom)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateNavbarOffset = () => {
      const header = document.querySelector<HTMLElement>('.glass-navbar')
      if (!header) return
      const { height } = header.getBoundingClientRect()
      const paddedOffset = Math.ceil(height + 24)
      document.documentElement.style.setProperty('--navbar-height', `${height}px`)
      document.documentElement.style.setProperty('--navbar-offset', `${paddedOffset}px`)
    }

    const handleResize = () => {
      updateNavbarOffset()
    }

    updateNavbarOffset()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = query.trim()
    if (q.length > 0) {
      navigate(`/products?q=${encodeURIComponent(q)}`)
    } else {
      navigate('/products')
    }
  }

  // Handle navigation with toggle behavior
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault()
    
    // If we're already on this page, go back to where we came from
    if (location.pathname === path) {
      navigate(-1)
    } else {
      // Navigate normally - browser will handle state preservation
      navigate(path)
    }
  }

  const handleLogout = () => {
    // Logout immediately - no slow splash
    logout()
    navigate('/auth')
  }

  const handleProfileClick = () => {
    if (userStatus.isGuest) {
      // Show modal for guest users
      setShowGuestModal(true)
    } else {
      navigate('/profile')
    }
  }

  return (
    <>
    <header className="glass-navbar z-50 px-3 sm:px-4">
      <div className="mx-auto flex w-full max-w-full flex-wrap items-center gap-2 py-2 sm:gap-3 md:flex-nowrap">
        {/* Menu Button */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm ring-1 ring-cyan-400/30 transition-all hover:scale-105 hover:ring-cyan-400/50"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5 text-cyan-100" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 text-cyan-200 hover:text-cyber-neonAccent">
            <img src="/logo.jpeg" alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-sm font-semibold tracking-wider whitespace-nowrap sm:text-base md:text-lg">PlayNex</span>
          </Link>
        </div>

        <form onSubmit={onSubmit} className="order-3 w-full md:order-none md:mx-4 md:flex-1 flex items-center gap-1 sm:gap-2 rounded-lg bg-white/5 p-1 sm:p-1.5 shadow-sm ring-1 ring-inset ring-[#00FFFF]/30 focus-within:ring-[#00FFFF]/60 relative">
          <Search className="ml-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-cyan-300" />
          <input
            value={query}
            onChange={(e) => {
              const value = e.target.value
              setQuery(value)
              
              // Live search - navigate as user types
              if (value.trim()) {
                navigate(`/products?q=${encodeURIComponent(value.trim())}`)
                
                // Generate suggestions
                const q = value.toLowerCase()
                const matches = allProducts
                  .filter(p => 
                    p.name.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.category?.toLowerCase().includes(q)
                  )
                  .slice(0, 5)
                  .map(p => p.name)
                setSuggestions(matches)
                setShowSuggestions(matches.length > 0)
              } else {
                // Clear search when input is empty
                navigate('/products')
                setSuggestions([])
                setShowSuggestions(false)
              }
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true)
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search..."
            className="neon-input w-full bg-transparent px-1 sm:px-1.5 py-1 text-xs sm:text-sm placeholder:text-cyan-200/40 focus:outline-none"
          />
          <button type="submit" className="hidden rounded-md bg-cyan-500/10 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-500/20 hover:text-white md:inline-block">
            Search
          </button>
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-md border border-cyan-400/30 rounded-lg shadow-xl shadow-cyan-500/20 overflow-hidden z-50">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion)
                    navigate(`/products?q=${encodeURIComponent(suggestion)}`)
                    setShowSuggestions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-cyan-100 hover:bg-cyan-500/20 transition-colors border-b border-cyan-400/10 last:border-b-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </form>

        <nav className="order-2 ml-auto flex w-full items-center justify-end gap-1.5 sm:order-none sm:w-auto sm:gap-2 md:gap-3">
          {/* Admin Badge */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-lg ring-1 ring-purple-400/40 cursor-default hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-shadow">
              <Shield className="h-4 w-4 text-purple-300 dark:text-purple-300 text-purple-700" />
              <span className="hidden sm:inline text-xs font-semibold text-purple-100 dark:text-purple-100 text-purple-900">ADMIN</span>
            </div>
          )}

          {/* Logout Button */}
          {isAdmin && !userStatus.isGuest && (
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-red-600/30 to-orange-600/30 rounded-lg ring-1 ring-red-400/40 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:from-red-600/40 hover:to-orange-600/40"
              title="Logout from Admin Mode"
            >
              <LogOut className="h-4 w-4 text-red-300 dark:text-red-300 text-red-700" />
              <span className="hidden sm:inline text-xs font-medium text-red-100 dark:text-red-100 text-red-900">Logout</span>
            </button>
          )}

          <Link
            to="/notifications"
            onClick={(e) => handleNavClick(e, '/notifications')}
            aria-label="Notifications"
            className="group relative inline-flex items-center rounded-lg p-2 text-cyan-200 hover:bg-white/5 hover:text-cyber-neonAccent"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                {notificationCount}
              </span>
            )}
          </Link>
          <Link 
            to="/wishlist" 
            onClick={(e) => handleNavClick(e, '/wishlist')}
            aria-label="Wishlist" 
            className="group relative inline-flex items-center rounded-lg p-2 text-cyan-200 hover:bg-white/5 hover:text-pink-400"
          >
            <Heart className="h-5 w-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          {/* My Orders - only for logged in users */}
          {!userStatus.isGuest && (
            <Link 
              to="/my-orders" 
              onClick={(e) => handleNavClick(e, '/my-orders')}
              aria-label="My Orders" 
              className="group relative inline-flex items-center rounded-lg p-2 text-cyan-200 hover:bg-white/5 hover:text-cyber-neonAccent"
              title="My Orders"
            >
              <Package className="h-5 w-5" />
            </Link>
          )}
          <Link 
            to="/cart" 
            onClick={(e) => handleNavClick(e, '/cart')}
            aria-label="Cart" 
            className="group relative inline-flex items-center rounded-lg p-2 text-cyan-200 hover:bg-white/5 hover:text-cyber-neonAccent"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-600/40 px-1.5 text-[10px] font-semibold text-white shadow-sm">{totalQuantity}</span>
          </Link>
          {userStatus.isGuest ? (
            <button 
              onClick={handleProfileClick}
              aria-label="Account" 
              className="hidden sm:inline-flex items-center rounded-lg p-2 text-cyan-200 hover:bg-white/5 hover:text-cyber-neonAccent"
            >
              <User className="h-6 w-6" />
            </button>
          ) : (
            <Link 
              to="/profile" 
              onClick={(e) => handleNavClick(e, '/profile')}
              aria-label="Account" 
              className="hidden sm:inline-flex items-center rounded-lg p-2 text-cyan-200 hover:bg-white/5 hover:text-cyber-neonAccent"
            >
              <User className="h-6 w-6" />
            </Link>
          )}
          <ThemeToggle className="inline-flex items-center justify-center rounded-full p-1.5 sm:p-2 backdrop-blur-md ring-1 transition-all shadow-md border dark:bg-cyan-500/20 dark:border-cyan-400/30 dark:ring-cyan-400/40 dark:hover:ring-cyan-400/60 dark:shadow-cyan-500/20 bg-white/40 border-white/10 ring-blue-400/70 hover:ring-blue-500 shadow-blue-500/30 hover:bg-white/50" />
        </nav>
      </div>
    </header>
    
    {/* Guest Restriction Modal */}
    <GuestRestrictionModal 
      isOpen={showGuestModal}
      onClose={() => setShowGuestModal(false)}
      action="access your profile"
    />
    </>
  )
}
