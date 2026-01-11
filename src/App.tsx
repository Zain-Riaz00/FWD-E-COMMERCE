import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import NavigationMenu from '@/components/layout/NavigationMenu'
import HomePage from '@/pages/HomePage'
import ProductsPage from '@/pages/ProductsPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import ProductGallery3D from '@/pages/ProductGallery3D'
import ProductDetailImmersive from '@/pages/ProductDetailImmersive'
import CategorySelectionPage from '@/pages/CategorySelectionPage'
import CommentPage from '@/pages/CommentPage'
import AuthPage from '@/pages/AuthPage'
import ProfilePage from '@/pages/ProfilePage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrderConfirmationPage from '@/pages/OrderConfirmationPage'
import OrderTrackingPage from '@/pages/OrderTrackingPage'
import MyOrdersPage from '@/pages/MyOrdersPage'
import NotificationPage from '@/pages/NotificationPage'
import ContactPage from '@/pages/ContactPage'
import AboutPage from '@/pages/AboutPage'
import HelpCenterPage from '@/pages/HelpCenterPage'
import TermsPage from '@/pages/TermsPage'
import ManageAdminsPage from '@/pages/ManageAdminsPage'
import FeedbackPage from '@/pages/FeedbackPage'
import InventoryAlertsPage from '@/pages/InventoryAlertsPage'
import OrdersPage from '@/pages/OrdersPage'
import AdminOrderDetailPage from '@/pages/AdminOrderDetailPage'
import UserLogsPage from '@/pages/UserLogsPage'
import AdminLogsPage from '@/pages/AdminLogsPage'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import FreezeScreen from '@/components/ui/FreezeScreen'
import { AdminProvider } from '@/contexts/AdminContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { siteSettingsAPI } from '@/services/api'

// Page transition animation variants - simple opacity fade
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
}

const pageTransition = {
  type: 'tween' as const,
  ease: 'linear' as const,
  duration: 0.1
}
 

function RoutesWithTransition({ onMenuToggle }: { onMenuToggle: () => void }) {
  const location = useLocation()
  const hideNavbar = location.pathname === '/auth'
  
  return (
    <>
      {!hideNavbar && <Navbar onMenuToggle={onMenuToggle} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<CategorySelectionPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/products/gallery/:id" element={<ProductGallery3D />} />
            <Route path="/products/immersive/:id" element={<ProductDetailImmersive />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/comment/:id/:viewType" element={<CommentPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/admin" element={<ManageAdminsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/inventory-alerts" element={<InventoryAlertsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<AdminOrderDetailPage />} />
            <Route path="/admin/order/:orderId" element={<AdminOrderDetailPage />} />
            <Route path="/user-logs" element={<UserLogsPage />} />
            <Route path="/admin-logs" element={<AdminLogsPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeMessage, setFreezeMessage] = useState('')
  const [bypassFreeze, setBypassFreeze] = useState(false)

  // Check freeze status on mount and periodically
  useEffect(() => {
    const checkFreezeStatus = async () => {
      const settings = await siteSettingsAPI.getSettings()
      if (settings && settings.isFrozen) {
        setIsFrozen(true)
        setFreezeMessage(settings.freezeMessage || 'The website is currently under maintenance. Please check back later.')
      } else {
        setIsFrozen(false)
      }
    }

    checkFreezeStatus()
    // Check every 30 seconds
    const interval = setInterval(checkFreezeStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Check if current user is admin
  const isAdmin = () => {
    const user = localStorage.getItem('user')
    if (!user) return false
    try {
      const userData = JSON.parse(user)
      return userData.isAdmin === true
    } catch {
      return false
    }
  }

  // Show freeze screen if frozen and not bypassed
  if (isFrozen && !bypassFreeze) {
    return (
      <BrowserRouter>
        <ThemeProvider>
          <AdminProvider>
            <AnimatedBackground />
            <FreezeScreen 
              message={freezeMessage}
              showAdminBypass={isAdmin()}
              onAdminBypass={() => setBypassFreeze(true)}
            />
          </AdminProvider>
        </ThemeProvider>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AdminProvider>
          <AnimatedBackground />
          <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          <RoutesWithTransition onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
        </AdminProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
