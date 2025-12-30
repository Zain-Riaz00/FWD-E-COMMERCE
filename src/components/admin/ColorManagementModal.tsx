import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Plus, Trash2, Palette } from 'lucide-react'
import type { ColorVariant } from '@/types/product'

interface ColorManagementModalProps {
  isOpen: boolean
  onClose: () => void
  initialColors: ColorVariant[]
  onSave: (colors: ColorVariant[]) => void
}

export default function ColorManagementModal({ 
  isOpen, 
  onClose, 
  initialColors, 
  onSave 
}: ColorManagementModalProps) {
  const [colors, setColors] = useState<ColorVariant[]>(initialColors)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [tempColor, setTempColor] = useState<ColorVariant>({
    name: '',
    colorCode: '#000000',
    imageUrl: '',
    price: undefined,
  })
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Common color presets with names
  const colorPresets = [
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#FFFFFF' },
    { name: 'Gray', code: '#6B7280' },
    { name: 'Red', code: '#EF4444' },
    { name: 'Orange', code: '#F97316' },
    { name: 'Yellow', code: '#EAB308' },
    { name: 'Green', code: '#10B981' },
    { name: 'Blue', code: '#3B82F6' },
    { name: 'Indigo', code: '#6366F1' },
    { name: 'Purple', code: '#A855F7' },
    { name: 'Pink', code: '#EC4899' },
    { name: 'Rose', code: '#F43F5E' },
  ]

  useEffect(() => {
    setColors(initialColors)
  }, [initialColors])

  const handleAddColor = () => {
    console.log('handleAddColor called:', { name: tempColor.name, hasImage: !!tempColor.imageUrl })
    if (tempColor.name.trim() && tempColor.imageUrl) {
      if (editingIndex !== null) {
        // Update existing color
        setColors(prev => prev.map((c, i) => i === editingIndex ? tempColor : c))
        setEditingIndex(null)
        console.log('Updated existing color at index:', editingIndex)
      } else {
        // Add new color
        setColors(prev => {
          const newColors = [...prev, tempColor]
          console.log('Added new color, total:', newColors.length)
          return newColors
        })
      }
      // Reset form
      setTempColor({ name: '', colorCode: '#000000', imageUrl: '', price: undefined })
      setImagePreview('')
    } else {
      console.log('Validation failed - name or imageUrl missing')
    }
  }

  const handleEditColor = (index: number) => {
    setEditingIndex(index)
    setTempColor(colors[index])
    setImagePreview(colors[index].imageUrl)
  }

  const handleRemoveColor = (index: number) => {
    setColors(prev => prev.filter((_, i) => i !== index))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setTempColor(prev => ({ ...prev, imageUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setTempColor(prev => ({ ...prev, imageUrl: url }))
    setImagePreview(url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('ColorManagementModal handleSubmit called with colors:', colors)
    onSave(colors)
    onClose()
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setTempColor({ name: '', colorCode: '#000000', imageUrl: '', price: undefined })
    setImagePreview('')
  }

  const handlePresetColorClick = (preset: { name: string; code: string }) => {
    setTempColor(prev => ({
      ...prev,
      name: prev.name || preset.name, // Only set name if empty
      colorCode: preset.code,
    }))
  }

  const handleClearImage = () => {
    setImagePreview('')
    setTempColor(prev => ({ ...prev, imageUrl: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-br from-[#0a0e1a] to-[#020304] rounded-2xl p-5 shadow-2xl ring-2 ring-purple-400/30 max-h-[90vh] overflow-y-auto">
                {/* Animated Border Glow */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `conic-gradient(from 0deg at 50% 50%, 
                        transparent 0deg,
                        rgba(168, 85, 247, 0.4) 30deg,
                        rgba(147, 51, 234, 0.6) 60deg,
                        rgba(168, 85, 247, 0.4) 90deg,
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
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Manage Color Variants
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-purple-100" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  {/* Add/Edit Color Form */}
                  <div className="bg-black/40 rounded-lg p-4 border border-purple-400/20">
                    <h3 className="text-sm font-semibold text-purple-100 mb-3">
                      {editingIndex !== null ? 'Edit Color' : 'Add New Color'}
                    </h3>
                    
                    {/* Color Presets */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-purple-100 mb-2">
                        Quick Color Presets
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {colorPresets.map((preset) => (
                          <button
                            key={preset.code}
                            type="button"
                            onClick={() => handlePresetColorClick(preset)}
                            className="group relative flex flex-col items-center gap-1 p-2 rounded-lg bg-black/40 border border-purple-400/20 hover:border-purple-400/50 hover:bg-black/60 transition-all"
                            title={`${preset.name} - ${preset.code}`}
                          >
                            <div
                              className="w-8 h-8 rounded-md border-2 border-white/30 group-hover:border-white/60 transition-all shadow-lg"
                              style={{ backgroundColor: preset.code }}
                            />
                            <span className="text-[10px] text-purple-200/80 font-medium">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {/* Color Name */}
                      <div>
                        <label className="block text-xs font-medium text-purple-100 mb-1">
                          Color Name
                        </label>
                        <input
                          type="text"
                          value={tempColor.name}
                          onChange={(e) => setTempColor(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-1.5 text-sm bg-black/40 border border-purple-400/30 rounded-lg text-purple-100 placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                          placeholder="e.g., Black"
                        />
                      </div>

                      {/* Price (Optional) */}
                      <div>
                        <label className="block text-xs font-medium text-purple-100 mb-1">
                          Price (Optional)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tempColor.price || ''}
                          onChange={(e) => setTempColor(prev => ({ ...prev, price: e.target.value ? Number(e.target.value) : undefined }))}
                          className="w-full px-3 py-1.5 text-sm bg-black/40 border border-purple-400/30 rounded-lg text-purple-100 placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                          placeholder="Price"
                        />
                      </div>

                      {/* Color Code with Picker */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-purple-100 mb-1">
                          Color Picker
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={tempColor.colorCode || '#000000'}
                            onChange={(e) => setTempColor(prev => ({ ...prev, colorCode: e.target.value }))}
                            className="w-10 h-[34px] bg-black/40 border border-purple-400/30 rounded-lg cursor-pointer"
                            title="Pick a color"
                          />
                          <input
                            type="text"
                            value={tempColor.colorCode}
                            onChange={(e) => setTempColor(prev => ({ ...prev, colorCode: e.target.value }))}
                            className="flex-1 px-3 py-1.5 text-sm bg-black/40 border border-purple-400/30 rounded-lg text-purple-100 placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                            placeholder="#000000"
                          />
                        </div>
                      </div>

                      {/* Image URL */}
                      <div>
                        <label className="block text-xs font-medium text-purple-100 mb-1">
                          Image URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={tempColor.imageUrl}
                            onChange={handleImageUrlChange}
                            className="flex-1 px-3 py-1.5 text-sm bg-black/40 border border-purple-400/30 rounded-lg text-purple-100 placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Upload Button */}
                      <div className="col-span-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 px-3 py-2 bg-black/40 border-2 border-dashed border-purple-400/30 rounded-lg text-purple-100 hover:border-purple-400/50 hover:bg-black/60 transition-all flex items-center justify-center gap-2 text-xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image</span>
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
                      </div>

                      {/* Preview */}
                      <div>
                        {imagePreview ? (
                          <div className="w-full h-[40px] rounded-lg overflow-hidden bg-black/40 border border-purple-400/30">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=Invalid'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-[40px] rounded-lg bg-black/40 border border-dashed border-purple-400/30 flex items-center justify-center">
                            <span className="text-xs text-purple-400/40">Preview</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add/Update Button */}
                    <div className="mt-3 flex gap-2">
                      {editingIndex !== null && (
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-4 py-2 bg-black/40 text-purple-100 rounded-lg hover:bg-black/60 transition-all text-xs font-medium"
                        >
                          Cancel Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleAddColor}
                        disabled={!tempColor.name.trim() || !tempColor.imageUrl}
                        className="flex-1 px-4 py-2 bg-purple-500/30 text-purple-100 rounded-lg hover:bg-purple-500/40 transition-all flex items-center justify-center gap-2 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {editingIndex !== null ? 'Update Color' : 'Add Color'}
                      </button>
                    </div>
                  </div>

                  {/* Color List */}
                  <div>
                    <h3 className="text-sm font-semibold text-purple-100 mb-2">
                      Color Variants ({colors.length})
                    </h3>
                    {colors.length > 0 ? (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {colors.map((color, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-black/40 border border-purple-400/20 rounded-lg"
                          >
                            {/* Image Preview */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/60 flex-shrink-0">
                              <img
                                src={color.imageUrl}
                                alt={color.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Color Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border border-white/30"
                                  style={{ backgroundColor: color.colorCode || '#000000' }}
                                />
                                <span className="text-sm font-medium text-purple-100">{color.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-purple-300/60">{color.colorCode || '#000000'}</span>
                                {color.price && (
                                  <span className="text-xs text-green-400 font-semibold">Rs. {color.price}</span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditColor(index)}
                                className="p-2 bg-blue-500/30 text-blue-100 rounded-lg hover:bg-blue-500/40 transition-all"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(index)}
                                className="p-2 bg-red-500/30 text-red-100 rounded-lg hover:bg-red-500/40 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-purple-300/40 text-sm">
                        No colors added yet. Add your first color variant above.
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-sm border border-purple-400/30 rounded-lg text-purple-100 hover:bg-white/5 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={colors.length === 0}
                      className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save {colors.length} Color{colors.length !== 1 ? 's' : ''}
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
