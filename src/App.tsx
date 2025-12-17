import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
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
import NotificationPage from '@/pages/NotificationPage'
import ContactPage from '@/pages/ContactPage'
import AboutPage from '@/pages/AboutPage'
import HelpCenterPage from '@/pages/HelpCenterPage'
import TermsPage from '@/pages/TermsPage'
import ManageAdminsPage from '@/pages/ManageAdminsPage'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { AdminProvider } from '@/contexts/AdminContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
// import PageTransition from '@/components/ui/PageTransition'
 

function RoutesWithTransition({ onMenuToggle }: { onMenuToggle: () => void }) {
  const location = useLocation()
  const hideNavbar = location.pathname === '/auth'
  
  return (
    <>
      {!hideNavbar && <Navbar onMenuToggle={onMenuToggle} />}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<CategorySelectionPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/gallery/:id" element={<ProductGallery3D />} />
        <Route path="/products/immersive/:id" element={<ProductDetailImmersive />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/comment/:id/:viewType" element={<CommentPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/admin" element={<ManageAdminsPage />} />
      </Routes>
    </>
  )
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
