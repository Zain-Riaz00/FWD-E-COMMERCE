import ProductCard from '@/components/products/ProductCard'
import { ColorVariantModal } from '@/components/products/ColorVariantModal'
import EditProductModal from '@/components/admin/EditProductModal'
import { CategoryManagementModal } from '@/components/admin/CategoryManagementModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { Product, Category } from '@/types/product'
import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Folder, Filter, Grid, List, Eye, Edit2, Trash2 } from 'lucide-react'
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<{ show: boolean; categoryId: string | null }>({
    show: false,
    categoryId: null
  })
  const { isAdmin } = useAdmin()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  
  // Get admin email from localStorage
  const getAdminEmail = () => {
    try {
      const user = localStorage.getItem('user')
      if (user) {
        const userData = JSON.parse(user)
        return userData.email
      }
    } catch (e) {
      console.error('Error getting admin email:', e)
    }
    return undefined
  }

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
    
    // Show ALL categories, even if they have no products
    categories.forEach(cat => {
      const catProducts = products.filter(p => p.category === cat.id)
      // Show category even if it has no products
      groups.push({ category: cat, products: catProducts })
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
      // Check if this is an existing product (has an id)
      if (updatedProduct.id) {
        // Optimistic update - update UI immediately
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
        setChildProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
        
        // Update in database (works for both local and server products)
        await productAPI.update(updatedProduct.id, {
          ...updatedProduct,
          productType: updatedProduct.productType || 'parent',
          parentId: updatedProduct.parentId,
        }, getAdminEmail())
        
        console.log('[ProductsPage] Product updated successfully')
      } else {
        // For new products, create them as CHILD products (to appear in All Products view)
        const tempId = 'temp-' + crypto.randomUUID()
        const tempProduct = { ...updatedProduct, id: tempId }
        
        // Add to childProducts array for immediate display
        setChildProducts(prev => [...prev, tempProduct])
        
        // Generate unique ID for new product
        const productId = `admin-product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        
        // Create in MongoDB - mark as CHILD (not parent)
        const created = await productAPI.create({
          ...updatedProduct,
          id: productId, // Ensure unique ID
          productType: 'child', // Mark as child so it appears in All Products view
          parentId: null, // Child products shown in All Products have no parent
          imageUrl: updatedProduct.imageUrl || '/products/default.png',
          description: updatedProduct.description || 'No description provided',
        }, getAdminEmail())
        
        console.log('[ProductsPage] Product creation response:', created)
        
        // Replace temp with real product in childProducts ONLY
        if (created) {
          setChildProducts(prev => prev.map(p => p.id === tempId ? created : p))
          console.log('[ProductsPage] New product created:', created.name, 'with ID:', created.id)
        } else {
          // If creation failed, reload to sync with DB
          console.log('[ProductsPage] Product creation failed, reloading...')
          loadProducts()
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
      // Reload to sync with database
      loadProducts()
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    // Optimistic delete - remove from BOTH arrays immediately
    setProducts(prev => prev.filter(p => p.id !== productId))
    setChildProducts(prev => prev.filter(p => p.id !== productId))
    
    try {
      // Delete from MongoDB in background
      await productAPI.delete(productId, getAdminEmail())
    } catch (error) {
      console.error('Error deleting product:', error)
      // Reload to sync with database
      loadProducts()
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await categoryAPI.delete(categoryId)
      setCategories(prev => prev.filter(c => c.id !== categoryId && c._id !== categoryId))
      setConfirmDeleteCategory({ show: false, categoryId: null })
    } catch (error) {
      console.error('Error deleting category:', error)
      loadCategories()
    }
  }

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: '', // Empty id indicates this is a new product to be created
      name: 'New Product',
      price: 99.99,
      description: 'Add description here',
      imageUrl: getProductPlaceholder('new'),
      rating: 4.5,
    }
    setEditingProduct(newProduct)
    setIsModalOpen(true)
  }

  // Load products from MongoDB on mount - with instant local fallback
  const loadProducts = async () => {
    // INSTANT: Get local products immediately to prevent loading state
    const localData = productAPI.getLocalProducts()
    if (products.length === 0 && localData.length > 0) {
      const localParents = localData.filter(p => !p.parentId && (!p.productType || p.productType === 'parent'))
      const localChildren = localData.filter(p => p.productType === 'child')
      setProducts(localParents)
      setChildProducts(localChildren)
      setLoading(false)
      console.log('[ProductsPage] Loaded instant local products:', localParents.length, 'parents,', localChildren.length, 'children')
    }

    // Then get merged data (local + admin-added) from server
    try {
      const data = await productAPI.getAll()
      console.log('[ProductsPage] Got merged products from API:', data.length)
      
      // Filter to show ONLY parent products:
      const parentProducts = data.filter(p => {
        if (p.parentId) return false
        return !p.productType || p.productType === 'parent'
      })
      
      // Also get child products for "All Products" view
      const children = data.filter(p => p.productType === 'child')
      console.log('[ProductsPage] Filtered - parents:', parentProducts.length, ', children:', children.length)
      
      // Always update with merged data (local + admin-added)
      setProducts(parentProducts)
      setChildProducts(children)
      console.log('[ProductsPage] Updated with merged data (local + admin-added)')
    } catch (error) {
      console.log('[ProductsPage] Error fetching, using local products')
    } finally {
      setLoading(false)
    }
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
            {viewMode === 'all' ? childProducts.length : filteredProducts.length} items
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
            /* Category Cards Grid - Clickable cards that navigate to 3D gallery */
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Browse by Category</h2>
                <span className="text-sm text-cyan-400">{categories.length} {categories.length === 1 ? 'category' : 'categories'}</span>
              </div>
              
              {categories.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No categories available. Add categories to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {categories.map((category, index) => {
                    // Different hover colors for each category
                    const categoryColors = [
                      { border: 'hover:border-cyan-400/30', shadow: 'hover:shadow-cyan-500/10', eye: 'text-cyan-400' },
                      { border: 'hover:border-purple-400/30', shadow: 'hover:shadow-purple-500/10', eye: 'text-purple-400' },
                      { border: 'hover:border-pink-400/30', shadow: 'hover:shadow-pink-500/10', eye: 'text-pink-400' },
                      { border: 'hover:border-emerald-400/30', shadow: 'hover:shadow-emerald-500/10', eye: 'text-emerald-400' },
                      { border: 'hover:border-orange-400/30', shadow: 'hover:shadow-orange-500/10', eye: 'text-orange-400' },
                      { border: 'hover:border-blue-400/30', shadow: 'hover:shadow-blue-500/10', eye: 'text-blue-400' },
                      { border: 'hover:border-rose-400/30', shadow: 'hover:shadow-rose-500/10', eye: 'text-rose-400' },
                      { border: 'hover:border-violet-400/30', shadow: 'hover:shadow-violet-500/10', eye: 'text-violet-400' },
                    ]
                    const colors = categoryColors[index % categoryColors.length]
                    
                    return (
                    <motion.div
                      key={category.id}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative overflow-hidden rounded-xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl shadow-lg shadow-cyan-500/5 ${colors.border} hover:shadow-xl ${colors.shadow} transition-all duration-300`}
                    >
                      {/* Admin Edit/Delete Buttons */}
                      {isAdmin && (
                        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCategory(category)
                              setIsCategoryModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 backdrop-blur-sm transition-all"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmDeleteCategory({ show: true, categoryId: category.id || category._id || '' })
                            }}
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 backdrop-blur-sm transition-all"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      )}
                      
                      {/* Category Image - Clickable - Reduced height */}
                      <div onClick={() => navigate(`/products/gallery/${category.id}`)} className="cursor-pointer">
                        {category.imageUrl && (
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent opacity-60" />
                          </div>
                        )}
                        
                        {/* Category Info */}
                        <div className="p-3">
                          <h3 className="text-base font-bold text-cyan-50 mb-1">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-xs text-cyan-300/70 line-clamp-1 mb-2">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-cyan-400">
                              {childProducts.filter(p => p.category === category.id).length} items
                            </span>
                            <Eye className={`w-4 h-4 ${colors.eye} opacity-0 group-hover:opacity-100 transition-opacity`} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Glassmorphic Border Glow */}
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />
                    </motion.div>
                  )
                  })}
                </div>
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
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
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
        onClose={() => {
          setIsCategoryModalOpen(false)
          setEditingCategory(null)
        }}
        initialCategories={editingCategory ? [editingCategory] : categories}
        onSaveCategories={(updatedCategories) => {
          setCategories(updatedCategories)
          setEditingCategory(null)
          loadCategories()
        }}
      />

      {/* Confirm Delete Category Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteCategory.show}
        onClose={() => setConfirmDeleteCategory({ show: false, categoryId: null })}
        onConfirm={() => {
          if (confirmDeleteCategory.categoryId) {
            handleDeleteCategory(confirmDeleteCategory.categoryId)
          }
        }}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
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
function ChildProductCard({ product, onClick, onEdit, onDelete }: { product: Product; onClick: () => void; onEdit?: (product: Product) => void; onDelete?: (productId: string) => void }) {
  const { isAdmin } = useAdmin()
  
  // Calculate real-time average rating from reviews
  const calculateAverageRating = () => {
    if (!product.reviews || product.reviews.length === 0) return 0
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0)
    return totalRating / product.reviews.length
  }
  
  const averageRating = calculateAverageRating()
  const reviewCount = product.reviews?.length || 0
  
  // Generate different hover colors based on product ID
  const hoverColors = [
    { border: 'group-hover:border-cyan-400/30', shadow: 'group-hover:shadow-cyan-500/10', badge: 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30 shadow-cyan-500/20', badgeText: 'text-cyan-300' },
    { border: 'group-hover:border-purple-400/30', shadow: 'group-hover:shadow-purple-500/10', badge: 'from-purple-500/20 to-pink-500/20 border-purple-400/30 shadow-purple-500/20', badgeText: 'text-purple-300' },
    { border: 'group-hover:border-pink-400/30', shadow: 'group-hover:shadow-pink-500/10', badge: 'from-pink-500/20 to-rose-500/20 border-pink-400/30 shadow-pink-500/20', badgeText: 'text-pink-300' },
    { border: 'group-hover:border-emerald-400/30', shadow: 'group-hover:shadow-emerald-500/10', badge: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30 shadow-emerald-500/20', badgeText: 'text-emerald-300' },
    { border: 'group-hover:border-orange-400/30', shadow: 'group-hover:shadow-orange-500/10', badge: 'from-orange-500/20 to-amber-500/20 border-orange-400/30 shadow-orange-500/20', badgeText: 'text-orange-300' },
    { border: 'group-hover:border-blue-400/30', shadow: 'group-hover:shadow-blue-500/10', badge: 'from-blue-500/20 to-indigo-500/20 border-blue-400/30 shadow-blue-500/20', badgeText: 'text-blue-300' },
    { border: 'group-hover:border-rose-400/30', shadow: 'group-hover:shadow-rose-500/10', badge: 'from-rose-500/20 to-red-500/20 border-rose-400/30 shadow-rose-500/20', badgeText: 'text-rose-300' },
    { border: 'group-hover:border-violet-400/30', shadow: 'group-hover:shadow-violet-500/10', badge: 'from-violet-500/20 to-purple-500/20 border-violet-400/30 shadow-violet-500/20', badgeText: 'text-violet-300' },
  ]
  
  const colorIndex = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % hoverColors.length
  const colors = hoverColors[colorIndex]

  return (
    <div
      className="group relative cursor-pointer hover:-translate-y-1 transition-transform duration-150"
      onClick={onClick}
    >
      {/* Card Container - Glassmorphic */}
      <div className={`relative overflow-hidden rounded-xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl shadow-lg shadow-cyan-500/5 ${colors.border} group-hover:shadow-xl ${colors.shadow}`}>
        
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
          
          {/* Admin Controls - Top Left Corner */}
          {isAdmin && (
            <div className="absolute top-2 left-2 z-10 flex gap-1">
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
                  onDelete?.(product.id)
                }}
                className="rounded-lg bg-white/40 dark:bg-red-500/30 border border-white/10 dark:border-red-400/40 p-1.5 backdrop-blur-md shadow-lg hover:bg-white/50 dark:hover:bg-red-500/40"
                title="Delete Product"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-300" />
              </button>
            </div>
          )}
          
          {/* 3D View Badge */}
          <div className={`absolute top-2 right-2 flex items-center gap-1 rounded-full bg-gradient-to-r ${colors.badge} px-2 py-1 backdrop-blur-xl border shadow-lg`}>
            <Eye className={`h-2.5 w-2.5 ${colors.badgeText}`} />
            <span className={`text-[10px] font-bold ${colors.badgeText}`}>3D</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="mb-2 font-bold text-sm text-cyan-50 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Rating - Always show, fill based on actual reviews */}
          <div className="mb-2 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-2.5 w-2.5 ${
                  i < Math.floor(averageRating)
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
              ({reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="text-center">
            <span className="text-lg font-bold text-cyan-400">Rs {product.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Glassmorphic Border Glow */}
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />
      </div>
    </div>
  )
}
