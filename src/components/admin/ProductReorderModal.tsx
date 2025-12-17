import { motion } from 'framer-motion'
import { X, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Product } from '../../types/product'

interface ProductReorderModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onReorder: (products: Product[]) => void
}

function SortableProduct({ product }: { product: Product }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 hover:border-cyan-500/30 transition-colors flex items-center gap-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-cyan-400 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            📦
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium text-sm truncate">
          {product.name}
        </h4>
        <p className="text-gray-400 text-xs">
          Rs. {product.price.toFixed(2)}
        </p>
      </div>
    </div>
  )
}

export function ProductReorderModal({
  isOpen,
  onClose,
  products,
  onReorder,
}: ProductReorderModalProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id === active.id)
      const newIndex = products.findIndex((p) => p.id === over.id)

      const newProducts = arrayMove(products, oldIndex, newIndex)
      onReorder(newProducts)
    }
  }

  const handleSave = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden border border-cyan-500/20"
      >
        {/* Header */}
        <div className="bg-gray-900/95 backdrop-blur-sm p-5 border-b border-cyan-500/20 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Reorder Products</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 overflow-y-auto max-h-[calc(85vh-140px)]">
          <p className="text-sm text-gray-400 mb-4">
            Drag products to reorder them in the 3D gallery. The first product will appear at the front.
          </p>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={products.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {products.map((product) => (
                  <SortableProduct key={product.id} product={product} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer */}
        <div className="bg-gray-900/95 backdrop-blur-sm p-5 border-t border-cyan-500/20 flex justify-end gap-3">
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
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}
