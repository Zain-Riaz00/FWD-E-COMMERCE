import { useState } from 'react'
import { Sparkles, TrendingUp, Zap, ShoppingCart, Eye } from 'lucide-react'
import type { Product } from '@/types/product'
import { ColorVariantModal } from '@/components/products/ColorVariantModal'

interface ProductSectionProps {
  title: string
  description?: string
  products: Product[]
  icon?: 'trending' | 'popular' | 'new' | 'electronics'
  gradient?: string
}

const iconMap = {
  trending: TrendingUp,
  popular: Sparkles,
  new: Zap,
  electronics: ShoppingCart,
}

const gradientMap = {
  trending: 'from-cyan-500 via-blue-500 to-purple-500',
  popular: 'from-pink-500 via-rose-500 to-orange-500',
  new: 'from-emerald-500 via-teal-500 to-cyan-500',
  electronics: 'from-violet-500 via-purple-500 to-fuchsia-500',
}

export default function ProductSection({ 
  title, 
  description, 
  products, 
  icon = 'trending',
  gradient 
}: ProductSectionProps) {
  const Icon = iconMap[icon]
  const gradientClass = gradient || gradientMap[icon]
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <section 
      className="container py-6 md:py-8"
    >
      {/* Section Header */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientClass} shadow-lg shadow-cyan-500/30`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientClass}`}>
              {title}
            </span>
          </h2>
        </div>
        {description && (
          <p className="text-cyan-200/70 max-w-2xl ml-14">{description}</p>
        )}
      </div>

      {/* Products - Horizontal Scroll (Single Line) */}
      <div className="relative -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {products.slice(0, 12).map((product, index) => (
            <div key={`${product._id || product.id}-${index}`} className="flex-none w-[160px] sm:w-[180px] md:w-[200px]">
              <ProductCard 
                product={product}
                onClick={() => handleProductClick(product)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Color Variant Modal */}
      {selectedProduct && (
        <ColorVariantModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          childProduct={selectedProduct}
        />
      )}
    </section>
  )
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <div
      className="group relative cursor-pointer hover:-translate-y-1 transition-transform duration-150"
      onClick={onClick}
    >
      {/* Card Container - Glassmorphic */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl shadow-lg shadow-cyan-500/5 group-hover:border-cyan-400/30 group-hover:shadow-xl group-hover:shadow-cyan-500/10">
        
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-900/50 to-zinc-950/50">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent opacity-60" />
          
          {/* 3D View Badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-2 py-1 backdrop-blur-xl border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
            <Eye className="h-2.5 w-2.5 text-cyan-300" />
            <span className="text-[10px] font-bold text-cyan-100">3D</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="mb-2 font-bold text-sm text-cyan-50 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Rating */}
          {product.rating > 0 && (
            <div className="mb-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-2.5 w-2.5 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600 fill-gray-600'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-0.5 text-[10px] text-cyan-300/70">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* View Hint */}
          <div className="text-center">
            <span className="text-[10px] text-cyan-300/70">Click to view colors</span>
          </div>
        </div>

        {/* Glassmorphic Border Glow */}
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />
      </div>
    </div>
  )
}
