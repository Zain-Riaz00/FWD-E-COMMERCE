import ProductCard from '@/components/products/ProductCard'
import { ColorVariantModal } from '@/components/products/ColorVariantModal'
import EditProductModal from '@/components/admin/EditProductModal'
import { CategoryManagementModal } from '@/components/admin/CategoryManagementModal'
import type { Product, Category } from '@/types/product'
import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Folder, Filter, Grid, List, Eye } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'
import { motion } from 'framer-motion'
import { getProductPlaceholder } from '@/utils/placeholderImages'
import { productAPI, categoryAPI } from '@/services/api'

export default function ProductsPage() {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const filtersRef = useRef<HTMLDivElement | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grouped' | 'all'>('all') // Default to 'all' view
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedChildProduct, setSelectedChildProduct] = useState<Product | null>(null)
  const [isColorModalOpen, setIsColorModalOpen] = useState(false)
  const [childProducts, setChildProducts] = useState<Product[]>([])
  const { isAdmin } = useAdmin()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups: { category: Category | null; products: Product[] }[] = []
    
    // Products without category (Uncategorized)
    const uncategorized = products.filter(p => !p.category)
    if (uncategorized.length > 0) {
      groups.push({ 
        category: null, 
        products: uncategorized 
      })
    }
    
    // Products grouped by categories
    categories.forEach(cat => {
      const catProducts = products.filter(p => p.category === cat.id)
      if (catProducts.length > 0) {
        groups.push({ category: cat, products: catProducts })
      }
    })
    
    return groups
  }, [products, categories])

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    let filtered = products
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [products, selectedCategory, searchQuery])

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleSaveProduct = async (updatedProduct: Product) => {
    // Close modal immediately for better UX
    setIsModalOpen(false)
    
    try {
      if (updatedProduct._id) {
        // Optimistic update - update UI immediately
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
        // Then update MongoDB in background - ensure it stays as parent
        await productAPI.update(updatedProduct._id, {
          ...updatedProduct,
          productType: 'parent',
          parentId: undefined, // Parents have no parent
        })
      } else {
        // For new products, show a loading state briefly
        const tempId = 'temp-' + crypto.randomUUID()
        const tempProduct = { ...updatedProduct, id: tempId }
        setProducts(prev => [...prev, tempProduct])
        
        // Create in MongoDB - mark as parent
        const created = await productAPI.create({
          ...updatedProduct,
          productType: 'parent',
          parentId: undefined, // Parents have no parent
        })
        
        // Replace temp with real product
        if (created) {
          setProducts(prev => prev.map(p => p.id === tempId ? created : p))
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
      // Reload to sync with database
      loadProducts()
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    // Optimistic delete - remove from UI immediately
    setProducts(prev => prev.filter(p => p.id !== productId))
    
    try {
      // Delete from MongoDB in background
      await productAPI.delete(productId)
    } catch (error) {
      console.error('Error deleting product:', error)
      // Reload to sync with database
      loadProducts()
    }
  }

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: String(Date.now()),
      name: 'New Product',
      price: 99.99,
      description: 'Add description here',
      imageUrl: getProductPlaceholder('new'),
      rating: 4.5,
    }
    setEditingProduct(newProduct)
    setIsModalOpen(true)
  }

  // Load products from MongoDB on mount
  const loadProducts = async () => {
    setLoading(true)
    const data = await productAPI.getAll()
    console.log('Loaded all products:', data.length, data)
    // Filter to show ONLY parent products:
    // CRITICAL: If parentId exists, it's definitely a child/grandchild - EXCLUDE IT
    // Then check: productType must be 'parent' OR undefined (legacy products without type)
    const parentProducts = data.filter(p => {
      // First rule: If it has a parentId, it's NOT a parent - exclude
      if (p.parentId) return false
      
      // Second rule: If no parentId, include if it's marked as parent OR has no type (legacy)
      return !p.productType || p.productType === 'parent'
    })
    // Also get child products for "All Products" view
    const children = data.filter(p => p.productType === 'child')
    console.log('Filtered parent products:', parentProducts.length, parentProducts)
    console.log('Filtered child products:', children.length, children)
    setProducts(parentProducts)
    setChildProducts(children)
    setLoading(false)
  }

  // Load products on component mount and refresh
  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  // Load categories from MongoDB
  const loadCategories = async () => {
    try {
      const data = await categoryAPI.getAll()
      console.log('Loaded categories:', data.length, data)
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  useEffect(() => {
    if (loading || products.length === 0) return
    
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.product-card')
      if (cards.length === 0) return
      
      gsap.fromTo(
        cards,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
          },
        },
      )
    })
    return () => ctx.revert()
  }, [loading, products, viewMode])

  return (
    <section className="min-h-screen pt-16 py-10 w-full px-4 sm:px-6 lg:px-8 bg-[#050810] dark:bg-[#050810]">
      <div className="w-full">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-cyan-200/70 hover:text-cyan-100 transition-colors group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </button>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-200">Loading products from database...</p>
          </div>
        </div>
      )}

      {!loading && (
        <>

      <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-black/30 rounded-lg p-1 border border-cyan-400/20">
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'grouped'
                  ? 'bg-cyan-500/30 text-cyan-100 shadow-lg'
                  : 'text-gray-400 hover:text-cyan-200'
              }`}
            >
              <List className="w-4 h-4" />
              By Category
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-cyan-500/30 text-cyan-100 shadow-lg'
                  : 'text-gray-400 hover:text-cyan-200'
              }`}
            >
              <Grid className="w-4 h-4" />
              All Products
            </button>
          </div>
          
          <p className="text-sm text-zinc-400">
            {viewMode === 'all' ? products.length : filteredProducts.length} items
          </p>
          {isAdmin && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 dark:bg-orange-600/20 border border-white/10 dark:border-orange-400/30 text-slate-900 dark:text-orange-300 rounded-lg text-xs font-medium shadow-sm dark:shadow-orange-500/20 hover:shadow-md hover:bg-white/50 dark:hover:bg-orange-600/30 transition-all backdrop-blur-md ring-1 ring-orange-400/40"
              >
                <Folder className="w-3.5 h-3.5" />
                Categories
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 dark:bg-green-600/20 border border-white/10 dark:border-green-400/30 text-slate-900 dark:text-green-300 rounded-lg text-xs font-medium shadow-sm dark:shadow-green-500/20 hover:shadow-md hover:bg-white/50 dark:hover:bg-green-600/30 transition-all backdrop-blur-md ring-1 ring-green-400/40"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product
              </motion.button>
            </>
          )}
        </div>
      </div>
      <div className={`grid grid-cols-1 gap-6 ${!selectedCategory ? 'lg:grid-cols-6' : ''}`}>
        {/* Sticky vertical filter sidebar - hidden when category is selected */}
        {!selectedCategory && (
          <aside
            ref={filtersRef}
            className="filter-sidebar lg:col-span-1 lg:sticky lg:top-20 h-max rounded-xl p-3"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,10,14,0.9) 0%, rgba(6,8,16,0.9) 100%), radial-gradient(circle at 20% 0%, rgba(0,255,209,0.06), transparent 40%), radial-gradient(circle at 100% 50%, rgba(255,87,51,0.04), transparent 40%)',
              boxShadow: 'inset 0 0 0 1px rgba(0,255,255,0.10)',
            }}
          >
            <h2 className="mb-3 text-sm font-semibold text-cyan-100 dark:text-cyan-100 text-blue-700 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h2>
            
            {/* Quick Filters */}
            <h3 className="mb-2 text-xs font-semibold text-cyan-300/70 uppercase">Quick Filters</h3>
            <ul className="space-y-1 text-sm text-cyan-200/80">
              {['All', 'New', 'Popular', 'Sale', 'Trending'].map((label) => (
                <li key={label}>
                  <button
                    className="w-full rounded-md px-3 py-1.5 text-left transition-colors hover:bg-white/5"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
        {/* Products grid */}
        <div className={selectedCategory ? '' : 'lg:col-span-5'}>
          {viewMode === 'grouped' ? (
            /* Grouped by Category View */
            <div className="space-y-12">
              {groupedProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No products available. Add some products to get started!</p>
                </div>
              ) : (
                groupedProducts.map((group, idx) => (
                  <div key={group.category?.id || 'uncategorized'} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/20">
                      {group.category ? (
                        <>
                          <div
                            className="w-8 h-8 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: group.category.color }}
                          />
                          <div>
                            <h2 className="text-2xl font-bold text-white">
                              {group.category.name}
                            </h2>
                            {group.category.description && (
                              <p className="text-sm text-gray-400">
                                {group.category.description}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div>
                          <h2 className="text-2xl font-bold text-gray-300">
                            Uncategorized
                          </h2>
                          <p className="text-sm text-gray-400">
                            Products without a category
                          </p>
                        </div>
                      )}
                      <span className="ml-auto text-sm text-cyan-400 font-medium">
                        {group.products.length} {group.products.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Products Grid for this Category */}
                    <div 
                      ref={idx === 0 ? gridRef : null}
                      className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
                    >
                      {group.products.map((p) => (
                        <div key={p.id} className="product-card will-change-transform">
                          <ProductCard
                            product={p}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* All Products View - Show child products with color variant modal */
            <>
              {/* When no category selected (All Products) - show child products */}
              {!selectedCategory ? (
                <>
                  <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {childProducts.map((p) => (
                      <ChildProductCard
                        key={p.id}
                        product={p}
                        onClick={() => {
                          setSelectedChildProduct(p)
                          setIsColorModalOpen(true)
                        }}
                      />
                    ))}
                  </div>
                  {childProducts.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p>No products available.</p>
                    </div>
                  )}
                </>
              ) : (
                /* When category is selected - show parent products with 3D gallery */
                <>
                  <div ref={gridRef} className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((p) => (
                      <div key={p.id} className="product-card will-change-transform">
                        <ProductCard
                          product={p}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                        />
                      </div>
                    ))}
                  </div>
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p>No products found in this category.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
        categories={categories}
      />

      {/* Category Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        initialCategories={categories}
        onSaveCategories={setCategories}
      />

      {/* Color Variant Modal for child products */}
      {selectedChildProduct && (
        <ColorVariantModal
          isOpen={isColorModalOpen}
          onClose={() => {
            setIsColorModalOpen(false)
            setSelectedChildProduct(null)
          }}
          childProduct={selectedChildProduct}
        />
      )}
      </>
      )}
      </div>
    </section>
  )
}

// Child Product Card - like homepage, shows color variants on click
function ChildProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
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
