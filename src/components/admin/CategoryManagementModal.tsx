import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Edit2, Upload, Image as ImageIcon } from 'lucide-react'
import type { Category } from '../../types/product'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface CategoryManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveCategories: (categories: Category[]) => void
  initialCategories: Category[]
}

const defaultColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]

export function CategoryManagementModal({
  isOpen,
  onClose,
  onSaveCategories,
  initialCategories
}: CategoryManagementModalProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    imageUrl: ''
  })
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; categoryId: string | null }>({
    show: false,
    categoryId: null
  })

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  // Auto-assign color based on category count
  const getNextColor = () => {
    return defaultColors[categories.length % defaultColors.length]
  }

  // Compress image to reduce size
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Resize to max 400px width while maintaining aspect ratio
          const maxWidth = 400
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Compress to 70% quality
          const compressed = canvas.toDataURL('image/jpeg', 0.7)
          resolve(compressed)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressed = await compressImage(file)
        setImagePreview(compressed)
        setNewCategory(prev => ({ ...prev, imageUrl: compressed }))
      } catch (error) {
        console.error('Error compressing image:', error)
        alert('Error processing image. Please try a different image or use a URL instead.')
      }
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setNewCategory(prev => ({ ...prev, imageUrl: url }))
    setImagePreview(url)
  }

  const handleAddCategory = () => {
    if (!newCategory.name?.trim()) {
      alert('Category name is required')
      return
    }

    if (!newCategory.imageUrl?.trim()) {
      alert('Category image is required')
      return
    }

    const category: Category = {
      id: `cat-${Date.now()}`,
      name: newCategory.name,
      description: newCategory.description || '',
      color: getNextColor(), // Auto-assign color
      imageUrl: newCategory.imageUrl
    }

    setCategories([...categories, category])
    setNewCategory({ name: '', description: '', imageUrl: '' })
    setImagePreview('')
  }

  const handleEditCategory = (id: string) => {
    const category = categories.find(c => c.id === id)
    if (category) {
      setNewCategory({ 
        name: category.name, 
        description: category.description,
        imageUrl: category.imageUrl || ''
      })
      setImagePreview(category.imageUrl || '')
      setEditingId(id)
    }
  }

  const handleUpdateCategory = () => {
    if (!editingId || !newCategory.name?.trim()) return

    if (!newCategory.imageUrl?.trim()) {
      alert('Category image is required')
      return
    }

    setCategories(categories.map(cat =>
      cat.id === editingId
        ? { 
            ...cat, 
            name: newCategory.name!, 
            description: newCategory.description || '',
            imageUrl: newCategory.imageUrl || ''
          }
        : cat
    ))

    setNewCategory({ name: '', description: '', imageUrl: '' })
    setImagePreview('')
    setEditingId(null)
  }

  const handleDeleteCategory = (id: string) => {
    setConfirmDelete({ show: true, categoryId: id })
  }

  const confirmDeleteCategory = () => {
    if (confirmDelete.categoryId) {
      setCategories(categories.filter(c => c.id !== confirmDelete.categoryId))
    }
    setConfirmDelete({ show: false, categoryId: null })
  }

  const handleSave = () => {
    onSaveCategories(categories)
    onClose()
  }

  const handleClearImage = () => {
    setImagePreview('')
    setNewCategory(prev => ({ ...prev, imageUrl: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 from-white to-gray-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border dark:border-cyan-500/20 border-blue-400/30"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 dark:bg-gray-900/95 bg-white/95 backdrop-blur-sm p-5 border-b dark:border-cyan-500/20 border-blue-400/30 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white dark:text-white text-slate-900">Manage Categories</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-400 text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Add/Edit Category Form */}
          <div className="bg-gray-800/50 dark:bg-gray-800/50 bg-white/80 rounded-lg p-4 border dark:border-cyan-500/20 border-blue-400/30 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-cyan-400 dark:text-cyan-400 text-blue-700 mb-3">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="Electronics, Clothing, etc."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newCategory.description || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="Optional description"
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Category Image *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {/* Image URL or Upload buttons */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newCategory.imageUrl || ''}
                    onChange={handleImageUrlChange}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    placeholder="Paste image URL or upload below"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-3 py-2 bg-black/40 border-2 border-dashed border-cyan-400/30 rounded-lg text-cyan-100 hover:border-cyan-400/50 hover:bg-black/60 transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Compress</span>
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="px-3 py-2 bg-red-500/30 border border-red-400/30 rounded-lg text-red-100 hover:bg-red-500/40 transition-all flex items-center gap-1 text-xs"
                        title="Clear image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Helper text */}
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-2">
                    <p className="text-xs text-blue-200/80">
                      📸 <strong>Upload:</strong> Images auto-compressed to save space
                    </p>
                    <p className="text-xs text-blue-200/60 mt-1">
                      🔗 <strong>Or use URL:</strong> Right-click image → Copy Image Address
                    </p>
                  </div>

                  {/* Preview */}
                  <div>
                    {imagePreview ? (
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-black/40 border border-cyan-400/30">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Invalid+Image'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-lg bg-black/40 border border-dashed border-cyan-400/30 flex flex-col items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-cyan-400/40 mb-1" />
                        <span className="text-xs text-cyan-400/40">No image selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                <p className="text-xs text-gray-400 mb-2">
                  🎨 Color will be automatically assigned from a vibrant palette
                </p>
                <div className="flex gap-1">
                  {defaultColors.slice(0, 8).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span className="text-gray-500 text-sm ml-1">...</span>
                </div>
              </div>

              <div className="flex gap-2">
                {editingId ? (
                  <>
                    <button
                      onClick={handleUpdateCategory}
                      className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Update Category
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setNewCategory({ name: '', description: '', imageUrl: '' })
                        setImagePreview('')
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddCategory}
                    className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Category
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">
              Categories ({categories.length})
            </h3>
            
            <AnimatePresence>
              {categories.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">
                  No categories yet. Add your first category above.
                </p>
              ) : (
                categories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50 hover:border-cyan-500/30 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Category Image */}
                      <div
                        className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-black/40 border border-gray-600/50"
                      >
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-gray-400 text-xs truncate">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category.id)}
                        className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm p-5 border-t border-cyan-500/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </motion.div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="Delete Category?"
        message="Products in this category will not be deleted, but they will no longer be associated with this category."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setConfirmDelete({ show: false, categoryId: null })}
      />
    </div>
  )
}
