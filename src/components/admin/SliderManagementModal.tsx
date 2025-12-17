import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react'
import type { Slide } from '@/types/product'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface SliderManagementModalProps {
  isOpen: boolean
  onClose: () => void
  slides: Slide[]
  onSave: (slides: Slide[]) => void
}

function SortableSlide({ slide, onEdit, onDelete }: { slide: Slide; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-black/40 border border-cyan-400/30 rounded-lg hover:bg-black/50 transition-all group"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-cyan-400/50 group-hover:text-cyan-400" />
      </div>
      
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/60 flex-shrink-0">
        {slide.imageUrl ? (
          <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-cyan-400/30" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-cyan-100 truncate">{slide.title || 'Untitled'}</h4>
        <p className="text-xs text-cyan-300/60 truncate">{slide.description || 'No description'}</p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 bg-blue-500/20 text-blue-100 rounded-lg hover:bg-blue-500/30 transition-all text-xs font-medium"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 bg-red-500/20 text-red-100 rounded-lg hover:bg-red-500/30 transition-all text-xs font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function SliderManagementModal({ isOpen, onClose, slides, onSave }: SliderManagementModalProps) {
  const [localSlides, setLocalSlides] = useState<Slide[]>(slides)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; slideId: string | null }>({ 
    show: false, 
    slideId: null 
  })
  
  const sensors = useSensors(useSensor(PointerSensor))
  
  useEffect(() => {
    setLocalSlides(slides)
  }, [slides])
  
  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active.id !== over.id) {
      setLocalSlides((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }))
      })
    }
  }
  
  function handleAddNew() {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
      order: localSlides.length,
    }
    setEditingSlide(newSlide)
    setIsEditMode(true)
  }
  
  function handleEdit(slide: Slide) {
    setEditingSlide(slide)
    setIsEditMode(true)
  }
  
  function handleDelete(slideId: string) {
    setConfirmDelete({ show: true, slideId })
  }
  
  function confirmDeleteSlide() {
    if (confirmDelete.slideId) {
      setLocalSlides(prev => prev.filter(s => s.id !== confirmDelete.slideId))
    }
    setConfirmDelete({ show: false, slideId: null })
  }
  
  function handleSaveSlide() {
    if (!editingSlide) return
    
    if (localSlides.some(s => s.id === editingSlide.id)) {
      setLocalSlides(prev => prev.map(s => s.id === editingSlide.id ? editingSlide : s))
    } else {
      setLocalSlides(prev => [...prev, editingSlide])
    }
    setIsEditMode(false)
    setEditingSlide(null)
  }
  
  function handleSubmit() {
    onSave(localSlides)
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl ring-1 ring-cyan-400/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-400/20 bg-black/40 px-6 py-4 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-cyan-100">Manage Hero Slider</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-cyan-400/70 transition hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {!isEditMode ? (
              <>
                {/* Add New Button */}
                <button
                  onClick={handleAddNew}
                  className="w-full mb-4 px-4 py-3 bg-cyan-500/20 text-cyan-100 rounded-lg hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-2 font-medium border border-cyan-400/30"
                >
                  <Plus className="w-5 h-5" />
                  Add New Slide
                </button>
                
                {/* Slides List */}
                {localSlides.length > 0 ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={localSlides.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {localSlides.map(slide => (
                          <SortableSlide
                            key={slide.id}
                            slide={slide}
                            onEdit={() => handleEdit(slide)}
                            onDelete={() => handleDelete(slide.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="text-center py-12 text-cyan-400/50">
                    <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p>No slides yet. Add your first slide!</p>
                  </div>
                )}
              </>
            ) : (
              /* Edit Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-100 mb-2">Slide Title</label>
                  <input
                    type="text"
                    value={editingSlide?.title || ''}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    placeholder="Enter slide title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-cyan-100 mb-2">Description</label>
                  <textarea
                    value={editingSlide?.description || ''}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
                    rows={3}
                    placeholder="Enter description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-cyan-100 mb-2">Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setEditingSlide(prev => prev ? { ...prev, imageUrl: reader.result as string } : null)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-100 hover:file:bg-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                    <span className="text-xs text-cyan-300/60">Or paste URL:</span>
                    <input
                      type="text"
                      value={editingSlide?.imageUrl || ''}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                      className="w-full px-4 py-2.5 bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-cyan-100 mb-2">Button Text (Optional)</label>
                  <input
                    type="text"
                    value={editingSlide?.buttonText || ''}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, buttonText: e.target.value } : null)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    placeholder="Shop Now"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-cyan-100 mb-2">Link To (Optional)</label>
                  <input
                    type="text"
                    value={editingSlide?.linkTo || ''}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, linkTo: e.target.value } : null)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    placeholder="/products"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsEditMode(false)
                      setEditingSlide(null)
                    }}
                    className="flex-1 px-4 py-2.5 border border-cyan-400/30 rounded-lg text-cyan-100 hover:bg-white/5 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSlide}
                    className="flex-1 px-4 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all font-medium"
                  >
                    Save Slide
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {!isEditMode && (
            <div className="border-t border-cyan-400/20 bg-black/40 px-6 py-4 backdrop-blur-sm flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-cyan-400/30 rounded-lg text-cyan-100 hover:bg-white/5 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all font-medium"
              >
                Save Changes
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="Delete Slide?"
        message="This slide will be permanently removed from the carousel. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteSlide}
        onCancel={() => setConfirmDelete({ show: false, slideId: null })}
      />
    </AnimatePresence>
  )
}
