import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
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
import NotificationPage from '@/pages/NotificationPage'
import ContactPage from '@/pages/ContactPage'
import AboutPage from '@/pages/AboutPage'
import HelpCenterPage from '@/pages/HelpCenterPage'
import TermsPage from '@/pages/TermsPage'
import ManageAdminsPage from '@/pages/ManageAdminsPage'
import WishlistPage from '@/pages/WishlistPage'
import FeedbackPage from '@/pages/FeedbackPage'
import InventoryAlertsPage from '@/pages/InventoryAlertsPage'
import OrdersPage from '@/pages/OrdersPage'
import UserLogsPage from '@/pages/UserLogsPage'
import AdminLogsPage from '@/pages/AdminLogsPage'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { AdminProvider } from '@/contexts/AdminContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { WishlistProvider } from '@/context/WishlistContext'

// Page transition animation variants
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 }
}

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2
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
            <Route path="/comment/:id/:viewType" element={<CommentPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/admin" element={<ManageAdminsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/inventory-alerts" element={<InventoryAlertsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
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

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AdminProvider>
          <WishlistProvider>
            <AnimatedBackground />
            <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <RoutesWithTransition onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
          </WishlistProvider>
        </AdminProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
