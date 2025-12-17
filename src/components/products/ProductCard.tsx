import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@/types/product'
import { StarRating } from '@/components/ui/StarRating'
import { useAdmin } from '@/contexts/AdminContext'
import { Edit2, Trash2, Plus, Minus } from 'lucide-react'
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
  const [quantity, setQuantity] = useState(10) // Mock quantity
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; productId: string | null }>({ 
    show: false, 
    productId: null 
  })

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
    <motion.div
      whileHover={{ y: -8, rotateX: 2, rotateY: -2, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.6 }}
      className="card-3d group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0a0e1a]/70 to-[#020304]/70 p-3 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-400/10 backdrop-blur-sm hover:ring-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-500/30"
      style={{
        boxShadow:
          '0 0 0 1px rgba(0,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.02)',
      }}
    >
      {/* Admin Controls - Top Right Corner */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <motion.button
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(product)
            }}
            className="rounded-lg bg-white/40 dark:bg-blue-500/30 border border-white/10 dark:border-blue-400/40 p-1.5 backdrop-blur-md shadow-lg hover:bg-white/50 dark:hover:bg-blue-500/40 hover:shadow-blue-500/50 transition-all duration-300"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteClick(product.id)
            }}
            className="rounded-lg bg-white/40 dark:bg-red-500/30 border border-white/10 dark:border-red-400/40 p-1.5 backdrop-blur-md shadow-lg hover:bg-white/50 dark:hover:bg-red-500/40 hover:shadow-red-500/50 transition-all duration-300"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-300" />
          </motion.button>
        </div>
      )}

      <div role="button" tabIndex={0} onClick={() => navigate(`/products/gallery/${product.id}`)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/products/gallery/${product.id}`)} className="block cursor-pointer">
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-neutral-900">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full origin-center transform object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* Neon Accent thick animated border glow on hover */}
          <div
            className="pointer-events-none pulse-glow absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              boxShadow:
                '0 0 16px 2px rgba(0,255,255,0.25), 0 0 36px 8px rgba(0,255,209,0.25), 0 0 64px 18px rgba(0,255,255,0.2)',
            }}
          />
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
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuantityChange(-1)
                }}
                className="rounded bg-white/40 dark:bg-red-500/30 border border-white/10 dark:border-red-400/40 p-1 backdrop-blur-md hover:bg-white/50 dark:hover:bg-red-500/40 transition-all"
              >
                <Minus className="w-3 h-3 text-red-600 dark:text-red-300" />
              </motion.button>
              <span className="text-sm font-semibold text-cyan-100 min-w-[2rem] text-center">
                {quantity}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuantityChange(1)
                }}
                className="rounded bg-white/40 dark:bg-green-500/30 border border-white/10 dark:border-green-400/40 p-1 backdrop-blur-md hover:bg-white/50 dark:hover:bg-green-500/40 transition-all"
              >
                <Plus className="w-3 h-3 text-green-600 dark:text-green-300" />
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Card outer neon glow on hover */}
      <div
        className="pointer-events-none pulse-glow absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow:
            '0 0 18px 2px rgba(0,255,255,0.18), 0 0 42px 10px rgba(0,255,209,0.18), 0 0 80px 24px rgba(0,255,255,0.14)',
        }}
      />

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
    </motion.div>
  )
}
