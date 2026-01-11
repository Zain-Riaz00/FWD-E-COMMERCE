import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { Product3DImage } from '@/components/products/Product3DImage'
import { useCart } from '@/context/CartContext'
import { useAdmin } from '@/contexts/AdminContext'
import type { Product, Review } from '@/types/product'
import { useParams, useNavigate, Link } from 'react-router-dom'
import GalleryLoadingOverlay from '@/components/ui/GalleryLoadingOverlay'
import EditProductModal from '@/components/admin/EditProductModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Edit2, Plus, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { productAPI, categoryAPI } from '@/services/api'
import type { Category } from '@/types/product'

// Helper to calculate average rating
function getAverageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

interface FocusedProduct {
  product: Product
  position: THREE.Vector3
  index: number
}

/** Component to detect when the scene is ready */
function SceneReadyDetector({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    // Set a simple 1.5 second timer on mount
    const timer = setTimeout(() => {
      onReady()
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [onReady])
  
  return null
}

/** Camera that responds to vertical angle and zooms to focused product */
function CameraController({ 
  verticalAngle, 
  zoom, 
  focusedProduct 
}: { 
  verticalAngle: number
  zoom: number
  focusedProduct: FocusedProduct | null
}) {
  const { camera } = useThree()
  
  useFrame(() => {
    if (focusedProduct) {
      // Zoom toward the focused product (3 units in front of it)
      const targetPos = focusedProduct.position.clone().add(new THREE.Vector3(0, 0, 3))
      camera.position.lerp(targetPos, 0.05)
      camera.lookAt(focusedProduct.position)
    } else {
      // Full 360° vertical orbit - no limits! Distance controlled by zoom
      const yPos = Math.sin(verticalAngle) * zoom
      const zPos = Math.cos(verticalAngle) * zoom
      const target = new THREE.Vector3(0, yPos, zPos)
      camera.position.lerp(target, 0.1)
      camera.lookAt(0, 0, 0)
    }
  })
  
  return null
}

/** Arrange items on a ring and rotate the group via mouse drag while camera stays still. */
function RotatingRing({ 
  angle, 
  products,
  hoveredIndex,
  onProductClick,
  deletingProductId
}: { 
  angle: number
  products: Product[]
  hoveredIndex: number | null
  onProductClick: (product: Product, position: THREE.Vector3, index: number) => void
  deletingProductId: string | null
}) {
  const group = useRef<THREE.Group>(null!)
  
  // Dynamic radius based on product count
  const radius = useMemo(() => {
    const baseRadius = 4
    const radiusPerProduct = 0.6
    return baseRadius + Math.max(0, products.length - 3) * radiusPerProduct
  }, [products.length])
  
  const positions = useMemo(() => {
    const count = products.length
    return new Array(count).fill(0).map((_, i) => {
      const a = (i / count) * Math.PI * 2 // Full 360° circle
      const x = Math.sin(a) * radius
      const z = Math.cos(a) * radius
      return { a, x, z }
    })
  }, [products.length, radius])

  useFrame(() => {
    if (group.current) {
      // Smooth interpolation (lerp) for rotation
      const lerpFactor = 0.1 // Adjust for speed (0.05 = slower, 0.2 = faster)
      group.current.rotation.y += (angle - group.current.rotation.y) * lerpFactor
    }
  })

  return (
    <group ref={group}>
      {positions.map((p, idx) => {
        const worldPos = new THREE.Vector3(p.x, -0.2, p.z)
        const isDeleting = products[idx].id === deletingProductId
        
        return (
          <group 
            key={idx} 
            position={[p.x, -0.2, p.z]} 
            rotation={[0, p.a + Math.PI, 0]}
            scale={isDeleting ? 0.01 : 1}
          >
            <Product3DImage 
              imageUrl={products[idx].imageUrl}
              onClick={() => !isDeleting && onProductClick(products[idx], worldPos, idx)}
              isHovered={hoveredIndex === idx && !isDeleting}
              opacity={isDeleting ? 0 : 1}
            />
          </group>
        )
      })}
    </group>
  )
}

export default function ProductGallery3D() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isAdmin } = useAdmin()
  const [dragging, setDragging] = useState(false)
  const [angle, setAngle] = useState(0)
  const [verticalAngle, setVerticalAngle] = useState(0)
  const [zoom, setZoom] = useState(9.5)
  const [showZoomPanel, setShowZoomPanel] = useState(false)
  const [hoveredIndex, _setHoveredIndex] = useState<number | null>(null)
  const [focusedProduct, setFocusedProduct] = useState<FocusedProduct | null>(null)
  const [isTeleporting, setIsTeleporting] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true) // Auto-rotation enabled by default
  const [targetAngle, setTargetAngle] = useState(0) // Target angle for realignment
  const [isSceneLoading, setIsSceneLoading] = useState(true) // Loading state for 3D scene
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; productId: string | null }>({ 
    show: false, 
    productId: null 
  })
  const [reviews, setReviews] = useState<Review[]>([])
  const startX = useRef(0)
  const startY = useRef(0)
  const startAngle = useRef(0)
  const startVerticalAngle = useRef(0)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const [parentProduct, setParentProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [isCategory, setIsCategory] = useState(false)

  // Load product children (child products) from database based on parent ID OR category ID
  useEffect(() => {
    const loadProductChildren = async () => {
      try {
        // Check if this is a category ID
        const categories = await categoryAPI.getAll()
        const foundCategory = categories.find(c => c.id === id || c._id === id)
        
        if (foundCategory) {
          console.log('[3D Gallery] Loading products for category:', foundCategory.name)
          setCategory(foundCategory)
          setIsCategory(true)
          
          // Load all products in this category
          const allProducts = await productAPI.getAll()
          const categoryProducts = allProducts.filter(p => 
            p.category === foundCategory.id && p.productType === 'child'
          )
          setProducts(categoryProducts)
          console.log('[3D Gallery] Loaded', categoryProducts.length, 'products for category')
          return
        }
        
        // Otherwise, treat as parent product ID
        setIsCategory(false)
        
        // INSTANT: Get local products first for immediate display
        const localProducts = productAPI.getLocalProducts()
        
        // Find parent product in local data first
        let parent = localProducts.find(p => p.id === id || p._id === id)
        
        if (parent) {
          setParentProduct(parent)
          const parentDbId = parent._id || parent.id
          const localChildren = localProducts.filter(p => 
            (p.parentId === parentDbId || p.parentId === parent!.id) && p.productType === 'child'
          )
          if (localChildren.length > 0) {
            setProducts(localChildren)
            console.log('[3D Gallery] Loaded local children instantly:', localChildren.length)
          }
        }

        // Then get merged data (local + admin-added) from server
        const allProducts = await productAPI.getAll()
        console.log('[3D Gallery] Got merged products from API:', allProducts.length)
        
        // Find the parent product
        parent = allProducts.find(p => p.id === id || p._id === id)
        console.log('[3D Gallery] Found parent:', parent)
        setParentProduct(parent || null)
        
        if (!parent) {
          console.warn('[3D Gallery] Parent product not found for id:', id)
          return
        }
        
        // Use parent's _id (MongoDB ID) for filtering children
        const parentDbId = parent._id || parent.id
        console.log('[3D Gallery] Using parent DB ID:', parentDbId)
        
        // Filter to get only children of this parent product
        const children = allProducts.filter(p => {
          const matches = (p.parentId === parentDbId || p.parentId === parent!.id) && p.productType === 'child'
          if (matches) {
            console.log('[3D Gallery] Found child:', p.name, 'parentId:', p.parentId)
          }
          return matches
        })
        
        console.log('[3D Gallery] Total children found:', children.length)
        // Always update with merged data (local + admin-added)
        setProducts(children)
        console.log('[3D Gallery] Updated with merged children (local + admin-added)')
      } catch (error) {
        console.error('Error loading product children:', error)
        // Keep local products if available
        if (products.length === 0) setProducts([])
      }
    }

    loadProductChildren()
    
    // Reload children when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadProductChildren()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Fallback: Force loading screen to disappear after 1.5 seconds
    const loadingTimer = setTimeout(() => {
      setIsSceneLoading(false)
    }, 1500)
    
    return () => {
      clearTimeout(loadingTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [id])


  // NOTE: We don't auto-save on every products change because it causes issues
  // when navigating back (empty initial state overwrites saved data).
  // Instead, we save immediately in handleSaveProduct and handleDeleteVariant.

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || focusedProduct || dragging) return

    const animate = () => {
      setAngle((prev) => prev + 0.002) // Slow automatic rotation
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [autoRotate, focusedProduct, dragging])

  // Realignment effect - smoothly return to target angle when user stops dragging
  useEffect(() => {
    if (dragging || focusedProduct) return

    const realign = () => {
      setAngle((prev) => {
        const diff = targetAngle - prev
        // If close enough, snap to target and enable auto-rotation
        if (Math.abs(diff) < 0.01) {
          setAutoRotate(true)
          return targetAngle
        }
        // Otherwise, smoothly lerp toward target
        return prev + diff * 0.05
      })
      animationFrameRef.current = requestAnimationFrame(realign)
    }

    if (!autoRotate) {
      animationFrameRef.current = requestAnimationFrame(realign)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [dragging, focusedProduct, targetAngle, autoRotate])

  // Callback when scene is ready
  const handleSceneReady = () => {
    setIsSceneLoading(false)
  }

  // Determine the index closest to the camera: compute which card angle (a + angle)
  // is nearest to 0 (the front). We compare card base angles to the target (-angle).
  const activeIndex = useMemo(() => {
    const count = products.length
    if (count === 0) return 0
    const angles = new Array(count).fill(0).map((_, i) => (i / count) * Math.PI * 2)
    // Target is the negative of the group's rotation: cards' base angles should be
    // close to -angle to appear at the front after the group's rotation.
    const target = (((-angle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    let minIdx = 0
    let minDist = Infinity
    angles.forEach((a, i) => {
      let dist = Math.abs(target - a)
      if (dist > Math.PI) dist = 2 * Math.PI - dist
      if (dist < minDist) {
        minDist = dist
        minIdx = i
      }
    })
    return minIdx
  }, [angle, products.length])

  // Load reviews for active product (gallery view only)
  useEffect(() => {
    const currentProduct = focusedProduct ? focusedProduct.product : (products.length > 0 ? products[activeIndex] : null)
    if (!currentProduct?.id) {
      setReviews([])
      return
    }
    const loadReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/product/${currentProduct.id}?viewType=gallery`)
        if (response.ok) {
          const data = await response.json()
          setReviews(data && data.length > 0 ? data : [])
        } else {
          setReviews([])
        }
      } catch (error) {
        console.error('Error loading reviews:', error)
        setReviews([])
      }
    }
    loadReviews()
  }, [focusedProduct, activeIndex, products])

  // Mouse drag handlers on overlay div
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (focusedProduct) return // Disable drag when focused on a product
    setAutoRotate(false) // Stop auto-rotation when user starts dragging
    setDragging(true)
    startX.current = e.clientX
    startY.current = e.clientY
    startAngle.current = angle
    startVerticalAngle.current = verticalAngle
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || focusedProduct) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    // Horizontal rotation - faster and smoother
    setAngle(startAngle.current + dx * 0.008)
    // Vertical camera rotation - UNLIMITED 360° (no clamp!)
    setVerticalAngle(startVerticalAngle.current + dy * 0.006)
  }
  function onPointerUp() {
    if (dragging && !focusedProduct) {
      // When user releases, set target to current angle for realignment
      setTargetAngle(angle)
    }
    setDragging(false)
  }

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (focusedProduct) return // Disable zoom when focused
    e.preventDefault()
    // Zoom in/out with mouse wheel (3.5 to 15 range)
    setZoom((prev) => Math.max(3.5, Math.min(15, prev + e.deltaY * 0.01)))
  }

  function handleProductClick(product: Product, position: THREE.Vector3, index: number) {
    // Just zoom toward the product - don't auto-navigate
    setFocusedProduct({ product, position, index })
  }

  function handleBackToRing() {
    setFocusedProduct(null)
  }

  const active = focusedProduct ? focusedProduct.product : (products.length > 0 ? products[activeIndex] : null)

  function handleAddToCart() {
    if (active) {
      // Randomly assign a color variant when adding from gallery
      const colors = ['Black', 'White', 'Blue', 'Red', 'Green']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      
      const productWithColor = {
        ...active,
        color: randomColor,
        id: `${active.id}-${randomColor.toLowerCase()}`, // Unique ID per color
        name: `${active.name} - ${randomColor}`
      }
      
      addItem(productWithColor, 1)
    }
  }

  function handleEnterImmersive() {
    if (!active) return
    
    if (!focusedProduct) {
      // If no product is focused, first zoom to the active product
      const index = activeIndex
      const baseRadius = 4
      const radiusPerProduct = 0.6
      const radius = baseRadius + Math.max(0, products.length - 3) * radiusPerProduct
      const count = products.length
      const a = (index / count) * Math.PI * 2
      const x = Math.sin(a) * radius
      const z = Math.cos(a) * radius
      const worldPos = new THREE.Vector3(x, -0.2, z)
      setFocusedProduct({ product: active, position: worldPos, index })
      
      // Then after zoom animation, teleport to immersive
      setTimeout(() => {
        setIsTeleporting(true)
        setTimeout(() => {
          navigate(`/products/immersive/${active.id}`)
        }, 600)
      }, 1200) // Wait for zoom animation
    } else if (focusedProduct) {
      // Already focused, go directly to immersive
      setIsTeleporting(true)
      setTimeout(() => {
        navigate(`/products/immersive/${focusedProduct.product.id}`)
      }, 600)
    }
  }

  // Product management handlers
  function handleAddProduct() {
    // Create a template product and open modal for admin to fill details
    const newProduct: Product = {
      id: 'new', // Identifier for new products
      name: 'New Product',
      price: 99.99,
      description: 'Add description here',
      imageUrl: '',
      rating: 4.5,
      features: [],
      colorVariants: [],
    }
    setEditingProduct(newProduct)
    setIsEditModalOpen(true)
  }

  function handleDeleteProduct(productId: string) {
    setConfirmDelete({ show: true, productId })
  }
  
  async function confirmDeleteProduct() {
    if (!confirmDelete.productId) return
    
    // Trigger fade-out animation on the specific card
    setDeletingProductId(confirmDelete.productId)
    
    // Wait for fade animation to complete before removing product from state
    setTimeout(async () => {
      try {
        // Find the product to get its _id
        const productToDelete = products.find(p => p.id === confirmDelete.productId)
        
        if (productToDelete?._id) {
          // Delete from database
          await productAPI.delete(productToDelete._id)
          console.log('Deleted child product from database:', productToDelete.name)
        }
        
        // Update local state
        const updatedProducts = products.filter(p => p.id !== confirmDelete.productId)
        setProducts(updatedProducts)
        
        // Close focused view if we deleted the focused product
        if (focusedProduct?.product.id === confirmDelete.productId) {
          setFocusedProduct(null)
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product. Please try again.')
      } finally {
        setDeletingProductId(null)
        setConfirmDelete({ show: false, productId: null })
      }
    }, 800) // Match the fade animation duration
  }

  async function handleSaveProduct(updatedProduct: Product) {
    // Close modal immediately for better UX
    setIsEditModalOpen(false)
    
    // Handle category-based products (no parent)
    if (isCategory && category) {
      console.log('Saving product to category:', category.name)
      
      try {
        if (updatedProduct.id && updatedProduct.id !== 'new' && updatedProduct._id) {
          // Update existing product
          await productAPI.update(updatedProduct._id, {
            ...updatedProduct,
            category: category.id,
            productType: 'child' as const,
            parentId: null
          })
          setProducts(prev => prev.map(p => p.id === updatedProduct.id ? { ...updatedProduct, category: category.id, productType: 'child' as const } : p))
        } else {
          // Create new product in category
          const created = await productAPI.create({
            ...updatedProduct,
            category: category.id,
            productType: 'child' as const,
            parentId: null
          })
          if (created) {
            setProducts(prev => [...prev, created])
          }
        }
      } catch (error) {
        console.error('Error saving product:', error)
        alert('Failed to save product')
      }
      return
    }
    
    // Handle parent product-based children
    if (!parentProduct) {
      console.error('Cannot save child: parent product not loaded')
      alert('Error: Parent product not found. Please refresh the page.')
      return
    }
    
    // Use parent's MongoDB _id as the parentId
    const parentDbId = parentProduct._id || parentProduct.id
    console.log('Saving child with parentId:', parentDbId)
    
    try {
      if (updatedProduct.id && updatedProduct.id !== 'new' && updatedProduct._id) {
        // Update existing child product in database
        const updateData = {
          ...updatedProduct,
          parentId: parentDbId, // Use parent's DB ID
          productType: 'child' as const,
        }
        console.log('Updating child:', updateData)
        await productAPI.update(updatedProduct._id, updateData)
        
        // Update local state
        const updatedProducts = products.map(p => p.id === updatedProduct.id ? { ...updatedProduct, parentId: parentDbId, productType: 'child' as const } : p)
        setProducts(updatedProducts)
        
        // Update focused product if it was the one being edited
        if (focusedProduct?.product.id === updatedProduct.id) {
          setFocusedProduct({ ...focusedProduct, product: { ...updatedProduct, parentId: parentDbId, productType: 'child' as const } })
        }
        
        console.log('Updated child product:', updatedProduct.name)
      } else {
        // Create new child product in database
        const createData = {
          ...updatedProduct,
          parentId: parentDbId, // Use parent's DB ID
          productType: 'child' as const,
          stock: 100,
        }
        console.log('Creating new child:', createData)
        const newChild = await productAPI.create(createData)
        
        if (newChild) {
          // Add to local state
          setProducts([...products, newChild])
          console.log('Created new child product:', newChild.name, 'with parentId:', newChild.parentId)
        }
      }
    } catch (error) {
      console.error('Error saving child product:', error)
      alert('Failed to save product. Please try again.')
    }
  }

  // color management removed from 3D gallery (handled elsewhere)

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full pt-16 text-cyan-100">
      {/* Loading overlay for scene initialization */}
      <GalleryLoadingOverlay isVisible={isSceneLoading} text="Loading 3D Gallery" />
      
      {/* Back button and Item count - hide during loading */}
      {!isSceneLoading && (
        <>
          <button
            onClick={() => navigate(-1)}
            className="absolute left-8 top-24 z-50 flex items-center gap-2 text-cyan-200/70 hover:text-cyan-100 transition-colors group"
          >
            <svg className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
          
          {/* Item Count Badge */}
          <div className="absolute left-8 top-36 z-50">
            <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 backdrop-blur-md border border-cyan-400/30 ring-1 ring-cyan-400/20 shadow-lg shadow-cyan-500/10">
              <p className="text-sm font-semibold text-cyan-100">
                <span className="text-cyan-400">{products.length}</span> {products.length === 1 ? 'item' : 'items'} available
              </p>
            </div>
          </div>
        </>
      )}

      {/* Teleport animation overlay */}
      <AnimatePresence>
        {isTeleporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black dark:bg-black bg-white"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, times: [0, 0.5, 1] }}
              className="relative"
            >
              <div className="h-64 w-64 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 blur-3xl" />
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="h-48 w-48 rounded-full border-4 border-cyan-400 border-t-transparent" />
              </motion.div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1, 0], y: [20, 0, -20] }}
              transition={{ duration: 0.8 }}
              className="absolute text-2xl font-bold text-cyan-100"
            >
              Entering Immersive Mode...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <section className="relative flex-1 overflow-hidden h-[60vh] lg:h-auto">
        {products.length === 0 ? (
          /* Empty State */
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md px-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-400/30"
              >
                <Package className="w-12 h-12 text-cyan-400" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-cyan-100 mb-3"
              >
                No Products Yet
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-cyan-200/70 mb-6"
              >
                {isAdmin 
                  ? "Get started by adding your first product to the gallery"
                  : "Check back soon! New products are on the way"}
              </motion.p>
              
              {isAdmin && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleAddProduct}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-100 rounded-lg font-semibold ring-1 ring-cyan-400/40 backdrop-blur-sm transition-all hover:from-cyan-500/30 hover:to-blue-500/30 hover:shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Add First Product
                </motion.button>
              )}
            </motion.div>
          </div>
        ) : (
          <Canvas 
            camera={{ position: [0, 1.4, 9.5], fov: 50 }}
            gl={{ 
              antialias: false,
              alpha: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false
            }}
            dpr={[1, 1.5]}
          >
            <SceneReadyDetector onReady={handleSceneReady} />
            <CameraController verticalAngle={verticalAngle} zoom={zoom} focusedProduct={focusedProduct} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[4, 5, 4]} intensity={0.6} color="#ffffff" />

            <RotatingRing 
              angle={angle} 
              products={products}
              hoveredIndex={hoveredIndex}
              onProductClick={handleProductClick}
              deletingProductId={deletingProductId}
            />
          </Canvas>
        )}
        <div
          className={`absolute inset-0 z-10 ${focusedProduct ? 'pointer-events-none' : dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={handleWheel}
        />
        
        {/* Navigation Controls - Left/Right arrows */}
        {!isSceneLoading && products.length > 0 && (
          <>
            <AnimatePresence>
              <motion.button
                key="prev"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setAutoRotate(false)
                  const step = (2 * Math.PI) / products.length
                  // Simply subtract one step - move backward
                  const targetAngle = angle - step
                  setAngle(targetAngle)
                  setTargetAngle(targetAngle)
                }}
                className="absolute left-8 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-cyan-100 backdrop-blur-md ring-1 ring-cyan-400/30 transition hover:bg-black/70 hover:ring-cyan-400/50"
                title="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.button
                key="next"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setAutoRotate(false)
                  const step = (2 * Math.PI) / products.length
                  // Simply add one step - move forward
                  const targetAngle = angle + step
                  setAngle(targetAngle)
                  setTargetAngle(targetAngle)
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-cyan-100 backdrop-blur-md ring-1 ring-cyan-400/30 transition hover:bg-black/70 hover:ring-cyan-400/50"
                title="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </AnimatePresence>
          </>
        )}

        {/* Zoom Controls - Expandable - hide during loading */}
        {!isSceneLoading && (
          <div className="absolute bottom-8 right-8 z-20">
          {/* Collapsed State - Just the Icon Button */}
          {!showZoomPanel && (
            <button
              onClick={() => setShowZoomPanel(true)}
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br dark:from-cyan-500/20 dark:to-cyan-600/10 from-white/80 to-white/60 backdrop-blur-md ring-1 dark:ring-cyan-400/30 ring-blue-400/60 transition-all hover:scale-110 dark:hover:ring-cyan-400/50 hover:ring-blue-500/80 hover:shadow-lg dark:hover:shadow-cyan-500/30 hover:shadow-blue-500/40"
              title="Zoom Controls"
            >
              <svg className="h-6 w-6 text-cyan-100 dark:text-cyan-100 text-blue-700 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          )}
          
          {/* Expanded State - Full Panel */}
          {showZoomPanel && (
            <div className="flex items-center gap-3 rounded-2xl bg-black/70 dark:bg-black/70 bg-white/80 p-3 backdrop-blur-xl ring-1 dark:ring-cyan-400/20 ring-blue-400/50 shadow-2xl dark:shadow-cyan-500/10 shadow-blue-500/20">
              {/* Close button */}
              <button
                onClick={() => setShowZoomPanel(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 dark:bg-cyan-500/10 bg-blue-100/80 text-cyan-300 dark:text-cyan-300 text-blue-700 transition hover:bg-cyan-500/20 dark:hover:bg-cyan-500/20 hover:bg-blue-200/80"
                title="Close"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Zoom Out Button */}
              <button
                onClick={() => setZoom((prev) => Math.min(15, prev + 0.5))}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 dark:bg-cyan-500/20 bg-blue-100/80 text-cyan-100 dark:text-cyan-100 text-blue-700 ring-1 ring-inset dark:ring-cyan-400/40 ring-blue-400/60 transition hover:bg-cyan-500/30 dark:hover:bg-cyan-500/30 hover:bg-blue-200/80 hover:scale-105"
                title="Zoom Out"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              
              {/* Horizontal Slider */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="3.5"
                  max="15"
                  step="0.1"
                  value={15 - zoom + 3.5}
                  onChange={(e) => setZoom(15 - Number(e.target.value) + 3.5)}
                  className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-cyan-500/20"
                  style={{
                    background: `linear-gradient(to right, #00FFFF ${((zoom - 3.5) / (15 - 3.5)) * 100}%, rgba(0,255,255,0.15) ${((zoom - 3.5) / (15 - 3.5)) * 100}%)`
                  }}
                />
                <span className="min-w-[2.2rem] text-xs font-medium text-cyan-300 dark:text-cyan-300 text-blue-700">{zoom.toFixed(1)}x</span>
              </div>
              
              {/* Zoom In Button */}
              <button
                onClick={() => setZoom((prev) => Math.max(3.5, prev - 0.5))}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 dark:bg-cyan-500/20 bg-blue-100/80 text-cyan-100 dark:text-cyan-100 text-blue-700 ring-1 ring-inset dark:ring-cyan-400/40 ring-blue-400/60 transition hover:bg-cyan-500/30 dark:hover:bg-cyan-500/30 hover:bg-blue-200/80 hover:scale-105"
                title="Zoom In"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
            </div>
          )}
        </div>
        )}
        
        {/* Glassmorphic Detail Card - Appears when product is focused */}
        <AnimatePresence>
          {focusedProduct && (
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-30 w-full lg:right-8 lg:left-auto lg:top-1/2 lg:w-96 lg:-translate-y-1/2 lg:bottom-auto"
            >
              <div className="relative overflow-hidden rounded-2xl bg-black/40 p-6 shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-400/30 backdrop-blur-2xl">
                {/* Close button */}
                <button
                  onClick={handleBackToRing}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-100">{focusedProduct.product.name}</h3>
                    <p className="mt-2 text-xl font-semibold text-cyan-300">Rs. {focusedProduct.product.price.toFixed(2)}</p>
                  </div>
                  
                  <p className="text-sm leading-relaxed text-cyan-200/80">
                    {focusedProduct.product.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(getAverageRating(reviews)) ? 'fill-current' : 'fill-none stroke-current'}`}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-cyan-200/70">{getAverageRating(reviews).toFixed(1)}</span>
                    <span className="text-xs text-cyan-400/60">({reviews.length})</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-xl px-4 py-2.5 text-sm font-semibold text-cyan-100 ring-1 ring-inset ring-cyan-400/50 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-500/40 hover:to-blue-500/40 hover:ring-cyan-300/60 hover:shadow-cyan-500/30 hover:scale-105"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleEnterImmersive}
                      className="group flex-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-xl border border-cyan-400/40 px-4 py-2.5 text-sm font-semibold text-cyan-100 shadow-lg shadow-purple-500/10 transition hover:border-cyan-300/60 hover:from-purple-500/30 hover:to-indigo-500/30 hover:shadow-purple-500/20 hover:scale-105"
                    >
                      <span className="flex items-center justify-center gap-1">
                        Immersive
                        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>
      
      {/* Only show details panel after loading is complete */}
      {!isSceneLoading && (
        <aside className="relative z-20 flex w-full lg:max-w-sm flex-col gap-4 border-t lg:border-t-0 lg:border-l border-cyan-500/10 bg-white/5 p-4 lg:p-8 backdrop-blur-lg overflow-y-auto max-h-[40vh] lg:max-h-none">
          {/* Selected product image */}
          {active?.imageUrl && (
            <div className="overflow-hidden rounded-lg ring-1 ring-cyan-400/20 shadow-xl shadow-cyan-500/10">
            <img src={active.imageUrl} alt={active.name} className="h-40 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-semibold text-cyan-100 transition-all duration-200 hover:text-cyan-400">{active?.name}</h2>
          <p className="mt-2 text-lg text-cyan-200/80">Rs. {active?.price.toFixed(2)}</p>
          {/* Rating and reviews */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(getAverageRating(reviews))
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-none text-cyan-700'
                  }`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
            <span className="text-sm text-cyan-200/70">{getAverageRating(reviews).toFixed(1)}</span>
            <span className="text-xs text-cyan-400/60">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-cyan-200/70">{active?.description}</p>
        {/* Leave a review button */}
        {active?.id && (
          <Link
            to={`/comment/${active.id}/gallery`}
            className="inline-block w-full text-center rounded-lg bg-purple-500/20 px-5 py-2.5 text-sm font-semibold text-purple-100 ring-1 ring-inset ring-purple-400/40 transition hover:bg-purple-500/30"
          >
            Leave a Comment or Review
          </Link>
        )}
        <div className="mt-auto space-y-3">
          {isAdmin && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (active) {
                      setEditingProduct(active)
                      setIsEditModalOpen(true)
                    }
                  }}
                  className="flex-1 rounded-lg bg-blue-500/20 dark:bg-blue-500/20 bg-white/70 px-5 py-2.5 text-sm font-semibold text-blue-100 dark:text-blue-100 text-slate-900 ring-1 ring-inset dark:ring-blue-400/40 ring-blue-500/60 transition hover:bg-blue-500/30 dark:hover:bg-blue-500/30 hover:bg-white/85 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                {/* Colors button removed from 3D gallery */}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 rounded-lg bg-green-500/20 dark:bg-green-500/20 bg-white/70 px-5 py-2.5 text-sm font-semibold text-green-100 dark:text-green-100 text-slate-900 ring-1 ring-inset dark:ring-green-400/40 ring-green-600/60 transition hover:bg-green-500/30 dark:hover:bg-green-500/30 hover:bg-white/85 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                <button
                  onClick={() => active && handleDeleteProduct(active.id)}
                  className="flex-1 rounded-lg bg-red-500/20 dark:bg-red-500/20 bg-white/70 px-5 py-2.5 text-sm font-semibold text-red-100 dark:text-red-100 text-slate-900 ring-1 ring-inset dark:ring-red-400/40 ring-red-600/60 transition hover:bg-red-500/30 dark:hover:bg-red-500/30 hover:bg-white/85 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
          <button 
            onClick={handleAddToCart}
            className="w-full rounded-lg bg-cyan-500/20 px-5 py-2.5 text-sm font-semibold text-cyan-100 ring-1 ring-inset ring-cyan-400/40 transition hover:bg-cyan-500/30"
          >
            Add to Cart
          </button>
          <button 
            onClick={handleEnterImmersive}
            className="group w-full rounded-lg border border-cyan-400/40 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-500/10"
          >
            <span className="flex items-center justify-center gap-2">
              Enter Immersive View
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </aside>
      )}

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="Delete Product?"
        message="This product will be removed from the gallery. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteProduct}
        onCancel={() => setConfirmDelete({ show: false, productId: null })}
      />

      {/* Color management removed from this view */}
    </div>
  )
}
