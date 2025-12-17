import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, Plus, Edit, Trash2, Save, X, Upload, 
  Palette, Image as ImageIcon, DollarSign,
  Grid, List, Search, LogOut, Users
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminManagementModal from '../components/admin/AdminManagementModal'
import PageContentEditor from '../components/admin/PageContentEditor'

interface Product {
  id: number
  name: string
  price: number
  description: string
  category: string
  stock: number
  images: string[]
  colors: string[]
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'products' | 'gallery' | 'colors'>('products')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isManagingAdmins, setIsManagingAdmins] = useState(false)
  const [isEditingPages, setIsEditingPages] = useState(false)

  // Check for location.state to open modals
  useEffect(() => {
    const state = location.state as { openModal?: string } | null
    if (state?.openModal === 'edit-pages') {
      setIsEditingPages(true)
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title)
    } else if (state?.openModal === 'manage-admins') {
      setIsManagingAdmins(true)
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // Get current admin email from localStorage
  const getCurrentAdminEmail = () => {
    const userProfile = localStorage.getItem('userProfile')
    if (userProfile) {
      const profile = JSON.parse(userProfile)
      return profile.email || 'admin@example.com'
    }
    return 'admin@example.com'
  }

  // Products data from database
  const [products, setProducts] = useState<Product[]>([])

  // Load products from MongoDB
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }
    loadProducts()
  }, [])

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    stock: 0,
    images: [],
    colors: []
  })

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated')
    navigate('/auth')
  }

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price) {
      try {
        const response = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newProduct.name,
            price: newProduct.price,
            description: newProduct.description || '',
            category: newProduct.category || 'Uncategorized',
            stock: newProduct.stock || 0,
            images: newProduct.images || [],
            colors: newProduct.colors || []
          })
        })
        
        if (response.ok) {
          const created = await response.json()
          setProducts([...products, created])
          setNewProduct({ name: '', price: 0, description: '', category: '', stock: 0, images: [], colors: [] })
          setIsAddingProduct(false)
        }
      } catch (error) {
        console.error('Error adding product:', error)
      }
    }
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter(p => 
    p?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p?.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
              Admin Panel
            </h1>
            <p className="text-white/60">Manage your products, gallery, and inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsManagingAdmins(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl transition-all backdrop-blur-sm border border-cyan-500/30"
            >
              <Users className="w-4 h-4" />
              Manage Admins
            </button>
            <button
              onClick={() => setIsEditingPages(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-all backdrop-blur-sm border border-purple-500/30"
            >
              <Edit className="w-4 h-4" />
              Edit Pages
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all backdrop-blur-sm border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 backdrop-blur-xl bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'gallery'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4 inline mr-2" />
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'colors'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4 inline mr-2" />
            Colors
          </button>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* View Mode */}
          <div className="flex gap-2 backdrop-blur-xl bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => setIsAddingProduct(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 dark:bg-purple-600/20 border border-white/10 dark:border-purple-400/30 text-slate-900 dark:text-purple-300 rounded-lg text-xs font-medium shadow-sm dark:shadow-purple-500/20 hover:shadow-md hover:bg-white/50 dark:hover:bg-purple-600/30 transition-all backdrop-blur-md ring-1 ring-purple-400/40"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Products Grid/List */}
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">{product.name}</h3>
                        <p className="text-sm text-white/60 mb-2">{product.category}</p>
                        <p className="text-white/70 text-sm mb-3">{product.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {/* Edit functionality can be added later */}}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-white font-semibold">Rs. {product.price}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-cyan-400" />
                          <span className="text-white/80 text-sm">{product.stock} in stock</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {product.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-5 h-5 rounded-full border-2 border-white/20"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {product.images.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <ImageIcon className="w-4 h-4" />
                          {product.images.length} image{product.images.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No products found</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Gallery Management</h2>
              <p className="text-white/60 mb-6">Upload and manage product images</p>
              
              <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-purple-500/50 transition-all cursor-pointer">
                <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/80 mb-2">Click to upload images</p>
                <p className="text-sm text-white/40">Drag and drop files here</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'colors' && (
            <motion.div
              key="colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Color Management</h2>
              <p className="text-white/60 mb-6">Add or remove color variants for products</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['#000000', '#FFFFFF', '#0EA5E9', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'].map((color, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl border-2 border-white/20 hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden group"
                    style={{ backgroundColor: color }}
                  >
                    <div className="w-full h-full bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-mono">{color}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddingProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsAddingProduct(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="backdrop-blur-xl bg-white/95 rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Add New Product</h3>
                  <button
                    onClick={() => setIsAddingProduct(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                    <input
                      type="text"
                      value={newProduct.name || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (PKR)</label>
                      <input
                        type="number"
                        value={newProduct.price || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder="2999.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
                      <input
                        type="number"
                        value={newProduct.stock || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <input
                      type="text"
                      value={newProduct.category || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="e.g., Electronics"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      value={newProduct.description || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsAddingProduct(false)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddProduct}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      Add Product
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Management Modal */}
      {isManagingAdmins && (
        <AdminManagementModal 
          isOpen={isManagingAdmins}
          onClose={() => setIsManagingAdmins(false)}
          currentAdminEmail={getCurrentAdminEmail()}
        />
      )}

      {/* Page Content Editor Modal */}
      {isEditingPages && (
        <PageContentEditor 
          isOpen={isEditingPages}
          onClose={() => setIsEditingPages(false)}
        />
      )}
    </div>
  )
}
