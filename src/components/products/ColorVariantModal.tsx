import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShoppingCart, X, Sparkles } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@/types/product'
import { productAPI } from '@/services/api'
import { isGuestUser } from '@/utils/guestUser'
import GuestRestrictionModal from '@/components/ui/GuestRestrictionModal'

interface ColorVariantModalProps {
  isOpen: boolean
  onClose: () => void
  childProduct: Product  // The child product (e.g., "Slipper") clicked from homepage
}

export function ColorVariantModal({ isOpen, onClose, childProduct }: ColorVariantModalProps) {
  const [colorVariants, setColorVariants] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const { addItem } = useCart()
  const navigate = useNavigate()

  // Load color variants (grandchildren) from database
  useEffect(() => {
    if (!isOpen || !childProduct.id) return

    const loadColorVariants = async () => {
      setLoading(true)
      try {
        const allProducts = await productAPI.getAll()
        console.log('[ColorVariantModal] Child product:', childProduct.name, 'ID:', childProduct.id, '_ID:', childProduct._id)
        console.log('[ColorVariantModal] Total products:', allProducts.length)
        
        // Check both childProduct.id and childProduct._id for matching
        const grandchildren = allProducts.filter(
          p => (p.parentId === childProduct.id || p.parentId === childProduct._id) && p.productType === 'grandchild'
        )
        
        console.log('[ColorVariantModal] Found grandchildren:', grandchildren.length, grandchildren.map(g => g.name))
        
        if (grandchildren.length > 0) {
          setColorVariants(grandchildren)
        } else {
          // No color variants - show the child product itself
          setColorVariants([childProduct])
        }
        setCurrentIndex(0)
      } catch (error) {
        console.error('Error loading color variants:', error)
        setColorVariants([childProduct])
      }
      setLoading(false)
    }

    loadColorVariants()
  }, [isOpen, childProduct])

  const currentVariant = colorVariants[currentIndex]

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + colorVariants.length) % colorVariants.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % colorVariants.length)
  }

  const handleAddToCart = () => {
    if (isGuestUser()) {
      setShowGuestModal(true)
      return
    }
    if (currentVariant) {
      addItem(currentVariant, 1)
    }
  }

  const handleBuyNow = () => {
    if (isGuestUser()) {
      setShowGuestModal(true)
      return
    }
    if (currentVariant) {
      addItem(currentVariant, 1)
      onClose()
      navigate('/checkout', {
        state: {
          product: currentVariant,
          quantity: 1
        }
      })
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl ring-1 ring-cyan-400/30 shadow-2xl shadow-cyan-500/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/30 transition hover:bg-cyan-500/20 hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8 p-8">
              {/* Left - Image with navigation */}
              <div className="relative flex flex-col items-center justify-center">
                {/* Navigation arrows */}
                {colorVariants.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-xl text-cyan-100 ring-1 ring-cyan-400/30 transition hover:bg-black/70 hover:scale-110 hover:ring-cyan-400/50"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-xl text-cyan-100 ring-1 ring-cyan-400/30 transition hover:bg-black/70 hover:scale-110 hover:ring-cyan-400/50"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Product Image */}
                {currentVariant && (
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden ring-1 ring-cyan-400/20 shadow-xl shadow-cyan-500/10">
                    <img
                      src={currentVariant.imageUrl}
                      alt={currentVariant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Variant indicator */}
                {colorVariants.length > 1 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm font-medium text-cyan-300/60">Color Variant</p>
                    <p className="text-2xl font-bold text-cyan-100">
                      {currentIndex + 1} <span className="text-lg text-cyan-400/50">/ {colorVariants.length}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Right - Details and actions */}
              {currentVariant && (
                <div className="flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Product name */}
                    <div>
                      <h2 className="text-3xl font-bold text-cyan-100">{currentVariant.name}</h2>
                      <p className="mt-2 text-4xl font-bold text-cyan-300">Rs. {currentVariant.price.toFixed(2)}</p>
                    </div>

                    {/* Rating */}
                    {(() => {
                      const averageRating = currentVariant.reviews && currentVariant.reviews.length > 0
                        ? currentVariant.reviews.reduce((sum, review) => sum + review.rating, 0) / currentVariant.reviews.length
                        : 0
                      const reviewCount = currentVariant.reviews?.length || 0
                      
                      return reviewCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`h-5 w-5 ${i < Math.floor(averageRating) ? 'fill-current' : 'fill-none stroke-current'}`}
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-cyan-200/70">{averageRating.toFixed(1)}</span>
                        </div>
                      ) : null
                    })()}

                    {/* Description */}
                    <div>
                      <p className="text-base leading-relaxed text-cyan-200/80">
                        {currentVariant.description || 'Premium quality product with excellent features and design.'}
                      </p>
                    </div>

                    {/* Features */}
                    {currentVariant.category && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wide">Category</h3>
                        <p className="text-cyan-200/70">{currentVariant.category}</p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3 mt-8">
                    {/* Immersive View Button */}
                    <button
                      onClick={() => {
                        onClose()
                        navigate(`/products/immersive/${childProduct.id}`)
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500/30 to-rose-500/30 backdrop-blur-xl px-6 py-3 text-sm font-semibold text-pink-100 ring-1 ring-inset ring-pink-400/50 shadow-lg shadow-pink-500/20 transition hover:from-pink-500/40 hover:to-rose-500/40 hover:ring-pink-300/60 hover:shadow-pink-500/30 hover:scale-[1.02]"
                    >
                      <Sparkles className="h-4 w-4" />
                      Immersive 3D View
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddToCart}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-xl px-6 py-4 text-base font-semibold text-cyan-100 ring-1 ring-inset ring-cyan-400/50 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-500/40 hover:to-blue-500/40 hover:ring-cyan-300/60 hover:shadow-cyan-500/30 hover:scale-105"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart
                      </button>
                      <button
                        onClick={handleBuyNow}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500/30 to-indigo-500/30 backdrop-blur-xl px-6 py-4 text-base font-semibold text-cyan-100 ring-1 ring-inset ring-purple-400/50 shadow-lg shadow-purple-500/20 transition hover:from-purple-500/40 hover:to-indigo-500/40 hover:ring-purple-300/60 hover:shadow-purple-500/30 hover:scale-105"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Guest Restriction Modal */}
      <GuestRestrictionModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        action="add items to cart"
      />
    </AnimatePresence>
  )
}
