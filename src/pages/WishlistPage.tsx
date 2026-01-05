import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types/product'

export default function WishlistPage() {
  const navigate = useNavigate()
  const { items, removeFromWishlist, clearWishlist } = useWishlist()
  const { addItem } = useCart()

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
    removeFromWishlist(product.id)
  }

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-cyan-200/70 hover:text-cyan-100 transition-colors mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-100 mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-pink-500" />
              My Wishlist
            </h1>
            <p className="text-cyan-200/70">{items.length} items saved for later</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart className="h-16 w-16 text-pink-500/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">Your wishlist is empty</h2>
            <p className="text-cyan-200/70 mb-6">Save items you love to your wishlist</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              Browse Products
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-[#0a0e1a]/80 to-[#020304]/80 backdrop-blur-sm rounded-xl ring-1 ring-cyan-400/20 overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-pink-500 hover:bg-red-500/30 transition-all"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-cyan-100 text-sm mb-1 truncate">{product.name}</h3>
                  <p className="text-cyan-300 font-bold">${product.price.toFixed(2)}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500/20 text-cyan-100 rounded-lg text-sm hover:bg-cyan-500/30 transition-all ring-1 ring-cyan-400/40"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
