import { useNavigate } from 'react-router-dom'
import type { Product } from '@/types/product'
import { StarRating } from '@/components/ui/StarRating'
import { useAdmin } from '@/contexts/AdminContext'
import { useWishlist } from '@/context/WishlistContext'
import { Edit2, Trash2, Plus, Minus, Heart } from 'lucide-react'
import { useState } from 'react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

type Props = {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onUpdateQuantity?: (productId: string, change: number) => void
}

export default function ProductCard({ product, onEdit, onDelete, onUpdateQuantity }: Props) {
  const navigate = useNavigate()
  const { isAdmin } = useAdmin()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(10) // Mock quantity
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; productId: string | null }>({ 
    show: false, 
    productId: null 
  })
  
  const inWishlist = isInWishlist(product.id)

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQty = Math.max(0, quantity + change)
    setQuantity(newQty)
    onUpdateQuantity?.(product.id, change)
  }

  const handleDeleteClick = (productId: string) => {
    setConfirmDelete({ show: true, productId })
  }

  const confirmDeleteProduct = () => {
    if (confirmDelete.productId) {
      onDelete?.(confirmDelete.productId)
    }
    setConfirmDelete({ show: false, productId: null })
  }

  return (
    <div
      className="card-3d group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0a0e1a]/70 to-[#020304]/70 p-3 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-400/10 backdrop-blur-sm hover:ring-cyan-400/30 hover:-translate-y-1 transition-transform duration-150"
      style={{
        boxShadow:
          '0 0 0 1px rgba(0,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.02)',
      }}
    >
      {/* Wishlist Button - Top Left Corner */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-2 left-2 z-10 rounded-full p-2 backdrop-blur-md shadow-lg transition-all ${
          inWishlist 
            ? 'bg-pink-500/30 ring-1 ring-pink-400/50 text-pink-400' 
            : 'bg-black/30 ring-1 ring-white/20 text-white/70 hover:text-pink-400 hover:bg-pink-500/20'
        }`}
        title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
      </button>

      {/* Admin Controls - Top Right Corner */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(product)
            }}
            className="rounded-lg bg-white/40 dark:bg-blue-500/30 border border-white/10 dark:border-blue-400/40 p-1.5 backdrop-blur-md shadow-lg hover:bg-white/50 dark:hover:bg-blue-500/40"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteClick(product.id)
            }}
            className="rounded-lg bg-white/40 dark:bg-red-500/30 border border-white/10 dark:border-red-400/40 p-1.5 backdrop-blur-md shadow-lg hover:bg-white/50 dark:hover:bg-red-500/40"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-300" />
          </button>
        </div>
      )}

      <div role="button" tabIndex={0} onClick={() => navigate(`/products/gallery/${product.id}`)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/products/gallery/${product.id}`)} className="block cursor-pointer">
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-neutral-900">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full origin-center object-cover"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="line-clamp-1 text-sm font-semibold text-cyan-100">{product.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <StarRating value={product.rating} />
              <span className="text-xs text-cyan-300/70">{product.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="shrink-0 text-sm font-medium text-cyan-100">Rs. {product.price.toFixed(2)}</p>
        </div>
      </div>

      {/* Admin Quantity Controls */}
      {isAdmin && (
        <div className="mt-3 pt-3 border-t border-cyan-400/20">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-cyan-300/70 dark:text-cyan-300/70 text-slate-900">Stock:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuantityChange(-1)
                }}
                className="rounded bg-white/40 dark:bg-red-500/30 border border-white/10 dark:border-red-400/40 p-1 backdrop-blur-md hover:bg-white/50 dark:hover:bg-red-500/40"
              >
                <Minus className="w-3 h-3 text-red-600 dark:text-red-300" />
              </button>
              <span className="text-sm font-semibold text-cyan-100 min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuantityChange(1)
                }}
                className="rounded bg-white/40 dark:bg-green-500/30 border border-white/10 dark:border-green-400/40 p-1 backdrop-blur-md hover:bg-white/50 dark:hover:bg-green-500/40"
              >
                <Plus className="w-3 h-3 text-green-600 dark:text-green-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="Delete Product?"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteProduct}
        onCancel={() => setConfirmDelete({ show: false, productId: null })}
      />
    </div>
  )
}
