import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import type { Product, Category } from '@/types/product'

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSave: (product: Product) => void
  categories?: Category[]
}

export default function EditProductModal({ isOpen, onClose, product, onSave, categories = [] }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    imageUrl: '',
    category: '',
  })
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState('')
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url')
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl,
        category: product.category || '',
      })
      setImagePreview(product.imageUrl)
      setFeatures(product.features || [])
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (product) {
      onSave({
        ...product,
        ...formData,
        imageUrl: imagePreview || formData.imageUrl,
        features,
      })
    }
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }))
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData(prev => ({ ...prev, imageUrl: url }))
    setImagePreview(url)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData(prev => ({ ...prev, imageUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures(prev => [...prev, newFeature.trim()])
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index))
  }

  const handleClearImage = () => {
    setImagePreview('')
    setFormData(prev => ({ ...prev, imageUrl: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Fixed positioning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={onClose}
          />

          {/* Modal - Beautiful Centered Card with FIXED positioning */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-br from-[#0a0e1a] to-[#020304] rounded-2xl p-5 shadow-2xl ring-2 ring-cyan-400/30 max-h-[90vh] overflow-y-auto">
              {/* Animated Border Glow */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `conic-gradient(from 0deg at 50% 50%, 
                      transparent 0deg,
                      rgba(6, 182, 212, 0.4) 30deg,
                      rgba(59, 130, 246, 0.6) 60deg,
                      rgba(6, 182, 212, 0.4) 90deg,
                      transparent 120deg,
                      transparent 360deg
                    )`,
                    maskImage: 'linear-gradient(transparent calc(100% - 2px), black calc(100% - 2px), black 100%, transparent 100%), linear-gradient(to right, transparent calc(100% - 2px), black calc(100% - 2px), black 100%, transparent 100%), linear-gradient(transparent 0%, black 0%, black 2px, transparent 2px), linear-gradient(to right, transparent 0%, black 0%, black 2px, transparent 2px)',
                    maskComposite: 'exclude',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 dark:from-cyan-400 dark:to-blue-400 from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {product?.id === String(Date.now()) ? 'Add New Product' : 'Edit Product'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-cyan-100" />
                </button>
              </div>

              {/* Form - Compact Grid Layout */}
              <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
                {/* Row 1: Name + Price (side by side) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Product Name */}
                  <div>
                    <label className="block text-xs font-medium text-cyan-100 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      placeholder="Premium Product"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-medium text-cyan-100 mb-1">
                      Price (PKR)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-1.5 text-sm bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      placeholder="2999.00"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Description + Category (side by side) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-cyan-100 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-1.5 text-sm bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none"
                      placeholder="Product description..."
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-cyan-100 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    >
                      <option value="">No Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {formData.category && categories.find(c => c.id === formData.category) && (
                      <div className="mt-1 flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: categories.find(c => c.id === formData.category)?.color }}
                        />
                        <span className="text-xs text-gray-400">
                          {categories.find(c => c.id === formData.category)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3: Image Upload + Preview (side by side) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-medium text-cyan-100 mb-1">
                      Product Image
                    </label>
                    
                    {/* Toggle between URL and Upload */}
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setImageSource('url')}
                        className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                          imageSource === 'url'
                            ? 'bg-cyan-500/30 dark:bg-cyan-500/30 bg-blue-100/80 text-cyan-100 dark:text-cyan-100 text-blue-700 ring-2 dark:ring-cyan-400/50 ring-blue-500/70'
                            : 'bg-black/20 dark:bg-black/20 bg-white/50 text-cyan-300/60 dark:text-cyan-300/60 text-blue-600 hover:bg-black/40 dark:hover:bg-black/40 hover:bg-white/70'
                        }`}
                      >
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSource('upload')}
                        className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                          imageSource === 'upload'
                            ? 'bg-cyan-500/30 dark:bg-cyan-500/30 bg-blue-100/80 text-cyan-100 dark:text-cyan-100 text-blue-700 ring-2 dark:ring-cyan-400/50 ring-blue-500/70'
                            : 'bg-black/20 dark:bg-black/20 bg-white/50 text-cyan-300/60 dark:text-cyan-300/60 text-blue-600 hover:bg-black/40 dark:hover:bg-black/40 hover:bg-white/70'
                        }`}
                      >
                        Upload
                      </button>
                    </div>

                    {/* URL Input */}
                    {imageSource === 'url' && (
                      <div className="relative">
                        <Upload className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-300/60" />
                        <input
                          type="text"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleImageUrlChange}
                          className="w-full pl-9 pr-3 py-1.5 text-sm bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                          placeholder="/products/image.png or https://..."
                        />
                      </div>
                    )}

                    {/* File Upload */}
                    {imageSource === 'upload' && (
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 px-3 py-2 bg-black/40 border-2 border-dashed border-cyan-400/30 rounded-lg text-cyan-100 hover:border-cyan-400/50 hover:bg-black/60 transition-all flex items-center justify-center gap-2 text-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={handleClearImage}
                            className="px-3 py-2 bg-red-500/30 border border-red-400/30 rounded-lg text-red-100 hover:bg-red-500/40 transition-all"
                            title="Clear image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Preview Image */}
                  <div>
                    <label className="block text-xs font-medium text-cyan-100 mb-1">
                      Preview
                    </label>
                    {imagePreview ? (
                      <div className="relative w-full h-[100px] rounded-lg overflow-hidden bg-black/40 border border-cyan-400/30">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Invalid+Image'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-[100px] rounded-lg bg-black/40 border border-dashed border-cyan-400/30 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-cyan-400/30" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Features Section */}
                <div>
                  <label className="block text-xs font-medium text-cyan-100 mb-1">
                    Features
                  </label>
                  
                  {/* Add Feature Input */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      className="flex-1 px-3 py-1.5 text-sm bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      placeholder="Add a feature..."
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-3 py-1.5 bg-cyan-500/30 text-cyan-100 rounded-lg hover:bg-cyan-500/40 transition-all flex items-center gap-1 text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>

                  {/* Features List */}
                  {features.length > 0 && (
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2 px-3 py-1.5 bg-black/40 border border-cyan-400/20 rounded-lg text-xs text-cyan-100"
                        >
                          <span className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-cyan-400" />
                            {feature}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-3 py-2 text-sm border border-cyan-400/30 rounded-lg text-cyan-100 hover:bg-white/5 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 text-sm bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg dark:hover:shadow-cyan-500/30 hover:shadow-blue-500/40 transition-all hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
