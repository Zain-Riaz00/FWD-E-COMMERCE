import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useAdmin } from '@/contexts/AdminContext'
import type { Product, ColorVariant, Review } from '@/types/product'
import { productAPI, reviewAPI } from '@/services/api'
// Helper to calculate average rating
function getAverageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
import { ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, Palette, Package } from 'lucide-react'
import EditProductModal from '@/components/admin/EditProductModal'
import ColorManagementModal from '@/components/admin/ColorManagementModal'
import GlassShatterEffect from '@/components/effects/GlassShatterEffect'

/** Floating glass card in 3D space */
function FloatingCard({ 
  position, 
  isActive,
  imageUrl 
}: { 
  position: [number, number, number]
  isActive: boolean
  imageUrl: string 
}) {
  const meshRef = useRef<THREE.Group>(null)
  const cardRef = useRef<THREE.Mesh>(null)
  const imageRef = useRef<THREE.Mesh>(null)
  const [texture] = useState(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(
      imageUrl,
      undefined, // onLoad
      undefined, // onProgress
      (error) => console.error('Texture loading error:', error) // onError
    )
    return tex
  })
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating on top of the base position
      const floatY = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.2
      meshRef.current.position.y = position[1] + floatY
      
      // Make card always face the center (origin)
      meshRef.current.lookAt(0, position[1] + floatY, 0)
    }
    
    if (cardRef.current) {
      // Active card glows and scales up smoothly
      const targetScale = isActive ? 1.2 : 1
      const targetEmissive = isActive ? 0.5 : 0.1
      
      cardRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.08 // Slower lerp for smoother transition
      )
      
      const material = cardRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = THREE.MathUtils.lerp(
        material.emissiveIntensity,
        targetEmissive,
        0.08
      )
    }
    
    if (imageRef.current) {
      // Smoothly fade image opacity based on active state
      const targetOpacity = isActive ? 1 : 0.4
      const material = imageRef.current.material as THREE.MeshStandardMaterial
      material.opacity = THREE.MathUtils.lerp(
        material.opacity,
        targetOpacity,
        0.08 // Smooth opacity transition
      )
    }
  })
  
  return (
    <group ref={meshRef} position={[position[0], position[1], position[2]]}>
      
      {/* Product image on front - pure, no overlay, no background */}
      <mesh ref={imageRef} position={[0, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={isActive ? 1 : 0.4}
          emissive="#000000"
          emissiveIntensity={0}
          metalness={0}
          roughness={1}
          side={THREE.DoubleSide}
          color={texture ? undefined : "#444444"}
        />
      </mesh>
      
      {/* Product image on back - same setup */}
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={isActive ? 1 : 0.4}
          emissive="#000000"
          emissiveIntensity={0}
          metalness={0}
          roughness={1}
          side={THREE.DoubleSide}
          color={texture ? undefined : "#444444"}
        />
      </mesh>
    </group>
  )
}

/** Particle stars in background */
function StarField() {
  const pointsRef = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const posArray = new Float32Array(500 * 3)
    for (let i = 0; i < 500; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 50
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 50
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return posArray
  }, [])
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00FFFF" transparent opacity={0.6} />
    </points>
  )
}

/** Static camera positioned to view the carousel with zoom support */
function CameraController({ distance }: { distance: number }) {
  useFrame(({ camera }) => {
    // Smoothly lerp camera distance for zoom effect
    const targetZ = distance
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1)
    camera.position.set(camera.position.x, 1.5, camera.position.z)
    camera.lookAt(0, 1.5, 0)
  })
  
  return null
}

/** Container that smoothly rotates all cards together */
function RotatingRing({ 
  children, 
  targetRotation 
}: { 
  children: React.ReactNode
  targetRotation: number 
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (groupRef.current) {
      // Smoothly lerp to target rotation for visible carousel effect
      // Use faster lerp for smoother transitions
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.08 // Faster rotation for better responsiveness
      )
    }
  })
  
  return <group ref={groupRef}>{children}</group>
}

export default function ProductDetailImmersive() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isAdmin } = useAdmin()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [ringRotation, setRingRotation] = useState(0) // Track smooth rotation
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isColorModalOpen, setIsColorModalOpen] = useState(false)
  const [editingProduct, _setEditingProduct] = useState<Product | null>(null)
  void _setEditingProduct; // Reserved for future use
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([])
  const [productData, setProductData] = useState<Product | null>(null)
  const [showShatterEffect, setShowShatterEffect] = useState(false)
  const [cameraDistance, setCameraDistance] = useState(18)
  const [showZoomPanel, setShowZoomPanel] = useState(false)

  // Reviews state per variant
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewUser, setReviewUser] = useState('');
  // Mark as used to prevent TypeScript errors - will be used in future review form
  void setReviewUser; void setReviewRating; void setReviewText;
  
  // Load reviews from database
  useEffect(() => {
    if (!id) return;
    
    const loadReviews = async () => {
      try {
        const fetchedReviews = await reviewAPI.getByProduct(id, 'immersive');
        console.log('[Immersive] Loaded reviews:', fetchedReviews);
        setReviews(fetchedReviews || []);
      } catch (error) {
        console.error('[Immersive] Error loading reviews:', error);
        setReviews([]);
      }
    };
    
    loadReviews();
  }, [id]);
  
  // Add review handler
  // @ts-ignore - function reserved for future use
  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewText.trim() || !reviewUser.trim()) return;
    const newReview: Review = {
      id: Date.now().toString(),
      productId: id!,
      userName: reviewUser,
      userId: '',
      rating: reviewRating,
      comment: reviewText,
      createdAt: new Date().toISOString(),
    };
    setReviews([newReview, ...reviews]);
    setReviewText('');
    setReviewRating(5);
  }

  console.log('ProductDetailImmersive render:', { id, productData, colorVariants })

  // Load grandchildren (color variants) from database based on parent child ID
  useEffect(() => {
    if (!id) return
    
    const loadColorVariants = async () => {
      try {
        // Check cache first
        const cacheKey = `immersive-product-${id}`;
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          console.log('[Immersive] Using cached product data');
          const cachedData = JSON.parse(cached);
          setProductData(cachedData.productData);
          setColorVariants(cachedData.colorVariants);
          return; // Use cached data, don't fetch from server
        }
        
        // Fetch all products from database if not cached
        console.log('[Immersive] Fetching from server');
        const allProducts = await productAPI.getAll()
        console.log('Immersive - URL id:', id)
        
        // First, find the parent (child product) to get its MongoDB _id
        const parent = allProducts.find(p => p.id === id || p._id === id)
        console.log('Immersive - Found parent (child):', parent)
        
        if (parent) {
          const productDataObj = {
            id: parent.id,
            _id: parent._id,
            name: parent.name || 'Product',
            price: parent.price || 0,
            description: parent.description || '',
            imageUrl: parent.imageUrl || '',
            rating: parent.rating || 4.5,
            features: [],
            colorVariants: [],
          };
          setProductData(productDataObj);
          
          // Use parent's _id (MongoDB ID) for filtering grandchildren
          const parentDbId = parent._id || parent.id
          console.log('Immersive - Using parent DB ID:', parentDbId)
          
          // Filter to get only grandchildren (color variants) of this child product
          const grandchildren = allProducts.filter(p => {
            const matches = (p.parentId === parentDbId || p.parentId === parent.id) && p.productType === 'grandchild'
            if (matches) {
              console.log('Immersive - Found grandchild:', p.name, 'parentId:', p.parentId)
            }
            return matches
          })
          
          console.log('Immersive - Total grandchildren found:', grandchildren.length)
          
          let variants: ColorVariant[] = [];
          if (grandchildren.length > 0) {
            // Convert grandchildren products to ColorVariant format for display
            variants = grandchildren.map(gc => ({
              color: gc.name,
              name: gc.name,
              imageUrl: gc.imageUrl,
              price: gc.price
            }))
          } else {
            // No grandchildren - show the parent product itself as a single variant
            console.log('Immersive - No grandchildren, using parent product as single variant')
            variants = [{
              color: parent.name,
              name: parent.name,
              imageUrl: parent.imageUrl,
              price: parent.price
            }]
          }
          
          setColorVariants(variants);
          
          // Cache only the minimal data needed (NOT the entire allProducts array)
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              productData: productDataObj,
              colorVariants: variants
            }));
          } catch (storageError) {
            // Ignore storage quota errors - continue without caching
            console.log('[Immersive] Could not cache data (quota exceeded)');
          }
        }
      } catch (error) {
        console.error('Error loading color variants:', error)
        setColorVariants([])
      }
    }
    
    loadColorVariants()
  }, [id])
  
  // NOTE: We don't auto-save on every colorVariants change because it causes issues
  // when the component loads (empty initial state would overwrite saved data).
  // Instead, we save immediately in handleSaveColors.

  const currentProduct = useMemo(() => {
    if (!productData || colorVariants.length === 0) return null
    
    return {
      ...productData,
      name: `${productData.name} - ${colorVariants[currentIndex]?.name || ''}`,
      imageUrl: colorVariants[currentIndex]?.imageUrl || productData.imageUrl,
    }
  }, [productData, colorVariants, currentIndex])

  // Arrange cards in a circle with FIXED positions (rotation happens on the group)
  const cardPositions = useMemo(() => {
    return colorVariants.map((_, i) => {
      // Each card has a FIXED position in the ring (no rotation applied here)
      const angleStep = (Math.PI * 2) / colorVariants.length
      const cardAngle = i * angleStep
      
      // Dynamic radius based on number of colors
      // Fewer colors = smaller radius (closer), more colors = larger radius (spread out)
      // Formula: base radius + additional spacing per color
      const baseRadius = 8 // Reduced from 10 for better mobile view
      const radiusPerColor = 1.0 // Reduced from 1.2 for tighter spacing
      const radius = baseRadius + (colorVariants.length - 3) * radiusPerColor
      
      const x = Math.sin(cardAngle) * radius
      const z = Math.cos(cardAngle) * radius
      const y = 1.5 // Centered position for better mobile framing
      
      return [x, y, z] as [number, number, number]
    })
  }, [colorVariants.length])

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % colorVariants.length)
    // Rotate ring counter-clockwise (visually rotates right to bring next card to front)
    setRingRotation((prev) => prev - (Math.PI * 2) / colorVariants.length)
  }

  function handlePrevious() {
    setCurrentIndex((prev) => (prev - 1 + colorVariants.length) % colorVariants.length)
    // Rotate ring clockwise (visually rotates left to bring previous card to front)
    setRingRotation((prev) => prev + (Math.PI * 2) / colorVariants.length)
  }

  function handleAddToCart() {
    if (currentProduct) {
      addItem(currentProduct, 1)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 2000)
    }
  }

  function handleBack() {
    navigate(-1)
  }

  async function handleSaveColors(newColors: ColorVariant[]) {
    console.log('handleSaveColors called with:', newColors)
    
    // If colors are being reduced, show shatter effect
    if (newColors.length < colorVariants.length) {
      setShowShatterEffect(true)
      setTimeout(() => setShowShatterEffect(false), 1000)
    }
    
    // Save color variants as grandchild products to database
    if (id && productData) {
      try {
        // Use productData's _id (MongoDB ID) as the parentId for grandchildren
        const parentDbId = productData._id || productData.id
        console.log('Saving grandchildren with parentId:', parentDbId)
        
        // Get all existing products
        const allProducts = await productAPI.getAll()
        
        // Find existing grandchildren for this child product (check both IDs)
        const existingGrandchildren = allProducts.filter(
          p => (p.parentId === parentDbId || p.parentId === productData.id) && p.productType === 'grandchild'
        )
        console.log('Existing grandchildren:', existingGrandchildren.length)
        
        // Delete grandchildren that are no longer in newColors
        for (const existing of existingGrandchildren) {
          const stillExists = newColors.some(c => c.name === existing.name)
          if (!stillExists && existing._id) {
            await productAPI.delete(existing._id)
            console.log('Deleted grandchild:', existing.name)
          }
        }
        
        // Update or create grandchildren from newColors
        for (const colorVariant of newColors) {
          // Check if this color already exists as a grandchild
          const existingGrandchild = existingGrandchildren.find(
            g => g.name === colorVariant.name
          )
          
          const grandchildData = {
            name: colorVariant.name,
            price: colorVariant.price || productData?.price || 0,
            description: productData?.description || `${colorVariant.name} variant`,
            imageUrl: colorVariant.imageUrl,
            rating: productData?.rating || 4.5,
            category: productData?.category,
            parentId: parentDbId, // Use parent's DB ID
            productType: 'grandchild' as const,
            stock: 100,
          }
          
          console.log('Saving grandchild with data:', grandchildData)
          
          if (existingGrandchild?._id) {
            // Update existing grandchild
            await productAPI.update(existingGrandchild._id, {
              ...existingGrandchild,
              ...grandchildData,
            })
            console.log('Updated grandchild:', colorVariant.name)
          } else {
            // Create new grandchild
            const created = await productAPI.create(grandchildData)
            console.log('Created grandchild:', colorVariant.name, 'with parentId:', created?.parentId)
          }
        }
        
        console.log('Successfully saved all color variants to database')
      } catch (error) {
        console.error('Error saving color variants to database:', error)
        alert('Failed to save color variants. Please try again.')
        return
      }
    }
    
    // Update state
    setColorVariants(newColors)
    
    // Also update productData
    setProductData(prev => {
      if (prev) {
        return { ...prev, colorVariants: newColors }
      }
      // If prev is null, create default productData
      return {
        id: id || 'unknown',
        name: 'Product Variant',
        price: 0,
        description: '',
        imageUrl: newColors[0]?.imageUrl || '',
        rating: 4.5,
        features: [],
        colorVariants: newColors,
      }
    })
    
    // Reset index if needed
    if (currentIndex >= newColors.length && newColors.length > 0) {
      setCurrentIndex(0)
      setRingRotation(0)
    }
    
    console.log('State updated, newColors length:', newColors.length)
  }

  // Camera distance is now controlled by zoom state (cameraDistance)

  // Empty state when no color variants
  if (!productData || colorVariants.length === 0) {
    return (
      <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-6 z-50 flex items-center gap-2 text-cyan-200/70 hover:text-cyan-100 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6 text-center px-4"
        >
          <motion.div
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full" />
            <Package className="w-24 h-24 text-cyan-400/60 relative z-10" strokeWidth={1.5} />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-cyan-100">No Color Variants Available</h2>
            <p className="text-cyan-400/60 max-w-md">
              {isAdmin 
                ? "Add color variants to display this product in immersive view."
                : "This product doesn't have any color options yet."}
            </p>
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsColorModalOpen(true)}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-100 rounded-lg backdrop-blur-sm ring-1 ring-cyan-400/40 transition-all flex items-center gap-2"
            >
              <Palette className="w-5 h-5" />
              Add Color Variants
            </motion.button>
          )}
        </motion.div>

        {/* Color Management Modal */}
        <ColorManagementModal
          isOpen={isColorModalOpen}
          onClose={() => setIsColorModalOpen(false)}
          initialColors={colorVariants}
          onSave={handleSaveColors}
        />
      </div>
    )
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <p className="text-cyan-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen w-full flex-col pt-16">
      {/* 3D Background with floating cards */}
      <div className="absolute inset-0 z-0 top-[-20vh] lg:top-0">
        <Canvas
          camera={{ position: [0, 2, cameraDistance], fov: 60 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          dpr={[1, 2]}
        >
          <CameraController distance={cameraDistance} />
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 5, 5]} intensity={0.4} color="#00FFFF" />
          <directionalLight position={[-5, -5, -5]} intensity={0.2} color="#FF00FF" />
          
          <StarField />
          
          <RotatingRing targetRotation={ringRotation}>
            {colorVariants.map((variant, i) => (
              <FloatingCard
                key={i}
                position={cardPositions[i]}
                isActive={i === currentIndex}
                imageUrl={variant.imageUrl}
              />
            ))}
          </RotatingRing>
        </Canvas>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute left-1/2 top-24 z-50 -translate-x-1/2"
          >
            <div className="rounded-lg bg-cyan-500/20 px-6 py-3 backdrop-blur-md ring-1 ring-cyan-400/50">
              <p className="text-sm font-semibold text-cyan-100">✓ Added to cart!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top navigation bar - Mobile */}
      <div className="absolute top-20 left-4 right-4 z-50 flex items-center justify-between gap-2 lg:hidden">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 text-cyan-200/70 backdrop-blur-md ring-1 ring-cyan-400/30 transition hover:bg-black/70 hover:text-cyan-100 hover:ring-cyan-400/50 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-medium">Back</span>
        </button>

        {/* Navigation controls - Compact - Moved higher to avoid overlap */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-cyan-200/70 backdrop-blur-md ring-1 ring-cyan-400/30 transition hover:bg-black/70 hover:text-cyan-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center rounded-lg bg-black/50 px-2.5 py-1 backdrop-blur-md ring-1 ring-cyan-400/30">
            <span className="text-[10px] font-medium text-cyan-300/60 leading-tight">Color {currentIndex + 1}/{colorVariants.length}</span>
            <span className="text-[9px] text-cyan-300/40 italic leading-tight">Select color</span>
          </div>

          <button
            onClick={handleNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-cyan-200/70 backdrop-blur-md ring-1 ring-cyan-400/30 transition hover:bg-black/70 hover:text-cyan-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Back button - Desktop only */}
      <button
        onClick={handleBack}
        className="hidden lg:flex absolute top-20 left-6 z-50 items-center gap-2 rounded-lg bg-black/50 px-3 py-2 text-cyan-200/70 backdrop-blur-md ring-1 ring-cyan-400/30 transition hover:bg-black/70 hover:text-cyan-100 hover:ring-cyan-400/50 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm">Back to Gallery</span>
      </button>

      {/* Product details overlay - Compact side panel */}
      <div className="relative z-10 flex flex-col lg:flex-row h-full items-stretch">
        {/* Left side - Product details (Smaller) */}
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120, delay: 0.2 }}
          className="flex w-full lg:w-[340px] flex-col bg-gradient-to-br from-black/50 via-black/40 to-transparent p-4 lg:p-6 backdrop-blur-lg overflow-y-auto max-h-[30vh] lg:max-h-none mt-auto lg:mt-0"
        >
          {/* Product image - Smaller */}
          <div className="relative overflow-hidden rounded-lg ring-1 ring-cyan-400/20 shadow-xl shadow-cyan-500/10">
            <img
              src={currentProduct.imageUrl}
              alt={currentProduct.name}
              className="h-48 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Product info - Compact */}
          <div className="mt-4 flex-1 space-y-3">
            <div>
              <h1 className="text-xl font-bold text-cyan-100">{currentProduct.name}</h1>
              <p className="mt-1 text-xl font-semibold text-cyan-300">
                Rs. {currentProduct.price.toFixed(2)}
              </p>
            </div>

            {/* Rating - Smaller */}

            {/* Average rating from reviews */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(getAverageRating(reviews))
                        ? 'fill-current'
                        : 'fill-none stroke-current'
                    }`}
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
              <span className="text-xs text-cyan-200/70">
                {getAverageRating(reviews).toFixed(1)}
              </span>
              <span className="text-xs text-cyan-400/60 ml-2">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
            {/* Leave a comment/review button */}
            <div className="mt-4">
              <Link
                to={`/comment/${id}/immersive`}
                className="inline-block px-4 py-2 rounded bg-cyan-500/30 text-cyan-100 font-semibold hover:bg-cyan-500/50 transition text-xs"
              >
                Leave a Comment or Review
              </Link>
            </div>

            {/* Description - Truncated */}
            <p className="text-xs leading-relaxed text-cyan-200/70 dark:text-cyan-200/70 text-slate-900 line-clamp-3">
              {currentProduct.description}
            </p>

            {/* Features - Minimal */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300/60 dark:text-cyan-300/60 text-blue-600">
                Features
              </h3>
              <ul className="space-y-1 text-xs text-cyan-200/60 dark:text-cyan-200/60 text-blue-700">
                {productData?.features && productData.features.length > 0 ? (
                  productData.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-cyan-400" />
                      <span>{feature}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-cyan-400" />
                      <span>Premium materials</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-cyan-400" />
                      <span>Advanced tech</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-cyan-400" />
                      <span>Eco-friendly</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Action buttons - Compact */}
            <div className="pt-3 space-y-2">
              {/* Add/Edit Colors button - Always visible */}
              <button
                onClick={() => setIsColorModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500/30 to-indigo-500/30 backdrop-blur-xl px-4 py-2.5 text-sm font-semibold text-cyan-100 ring-1 ring-inset ring-purple-400/50 shadow-lg shadow-purple-500/20 transition hover:from-purple-500/40 hover:to-indigo-500/40 hover:ring-purple-300/60 hover:shadow-purple-500/30 hover:scale-105"
              >
                <Palette className="h-4 w-4" />
                {colorVariants.length > 0 ? `Edit Colors (${colorVariants.length})` : 'Add Colors'}
              </button>
              <div className="flex flex-row gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-xl px-3 py-2 text-xs font-semibold text-cyan-100 ring-1 ring-inset ring-cyan-400/50 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-500/40 hover:to-blue-500/40 hover:ring-cyan-300/60 hover:shadow-cyan-500/30 hover:scale-105 whitespace-nowrap"
                >
                  <ShoppingCart className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={() => {
                    handleAddToCart()
                    navigate('/checkout', {
                      state: {
                        product: productData,
                        quantity: 1
                      }
                    })
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500/30 to-indigo-500/30 backdrop-blur-xl px-3 py-2 text-xs font-semibold text-cyan-100 ring-1 ring-inset ring-purple-400/50 shadow-lg shadow-purple-500/20 transition hover:from-purple-500/40 hover:to-indigo-500/40 hover:ring-purple-300/60 hover:shadow-purple-500/30 hover:scale-105 whitespace-nowrap"
                >
                  <ShoppingCart className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center/Right - Navigation controls and 3D view - Positioned at bottom to avoid card overlap */}
        <div className="hidden lg:flex flex-1 items-end justify-center gap-4 lg:gap-6 px-4 lg:px-8 pb-16 order-first lg:order-none">
          {/* Previous button */}
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={handlePrevious}
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-black/50 text-cyan-100 backdrop-blur-md ring-1 ring-cyan-400/30 transition hover:bg-black/70 hover:scale-110 hover:ring-cyan-400/50"
          >
            <ChevronLeft className="h-7 w-7" />
          </motion.button>

          {/* Current product indicator */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-xs font-medium text-cyan-300/60">Color Variant</p>
            <p className="text-3xl font-bold text-cyan-100">
              {currentIndex + 1} <span className="text-xl text-cyan-400/50">/ {colorVariants.length}</span>
            </p>
            <p className="mt-1 text-xs text-cyan-300/40 dark:text-cyan-300/40 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent italic">
              Select your color
            </p>
          </motion.div>

          {/* Next button */}
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={handleNext}
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-black/50 text-cyan-100 backdrop-blur-md ring-1 ring-cyan-400/30 transition hover:bg-black/70 hover:scale-110 hover:ring-cyan-400/50"
          >
            <ChevronRight className="h-7 w-7" />
          </motion.button>
        </div>
      </div>

      {/* Zoom Controls - Bottom Right */}
      {!showZoomPanel && (
        <div className="absolute bottom-8 right-4 lg:right-8 z-40">
          <button
            onClick={() => setShowZoomPanel(true)}
            className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br dark:from-cyan-500/20 dark:to-cyan-600/10 from-white/80 to-white/60 backdrop-blur-md ring-1 dark:ring-cyan-400/30 ring-blue-400/60 transition-all hover:scale-110 dark:hover:ring-cyan-400/50 hover:ring-blue-500/80 hover:shadow-lg dark:hover:shadow-cyan-500/30 hover:shadow-blue-500/40"
            title="Zoom Controls"
          >
            <svg className="h-6 w-6 text-cyan-100 dark:text-cyan-100 text-blue-700 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>
      )}

      {/* Expanded Zoom Panel */}
      {showZoomPanel && (
        <div className="absolute bottom-8 right-4 lg:right-8 z-40 flex items-center gap-3 rounded-2xl bg-black/70 dark:bg-black/70 bg-white/80 p-3 backdrop-blur-xl ring-1 dark:ring-cyan-400/20 ring-blue-400/50 shadow-2xl dark:shadow-cyan-500/10 shadow-blue-500/20">
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
            onClick={() => setCameraDistance((prev) => Math.min(30, prev + 1))}
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
              min="10"
              max="30"
              step="0.5"
              value={30 - cameraDistance + 10}
              onChange={(e) => setCameraDistance(30 - Number(e.target.value) + 10)}
              className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-cyan-500/20"
              style={{
                background: `linear-gradient(to right, #00FFFF ${((cameraDistance - 10) / (30 - 10)) * 100}%, rgba(0,255,255,0.15) ${((cameraDistance - 10) / (30 - 10)) * 100}%)`
              }}
            />
            <span className="min-w-[2.2rem] text-xs font-medium text-cyan-300 dark:text-cyan-300 text-blue-700">{((30 - cameraDistance + 10) / 10).toFixed(1)}x</span>
          </div>
          
          {/* Zoom In Button */}
          <button
            onClick={() => setCameraDistance((prev) => Math.max(10, prev - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 dark:bg-cyan-500/20 bg-blue-100/80 text-cyan-100 dark:text-cyan-100 text-blue-700 ring-1 ring-inset dark:ring-cyan-400/40 ring-blue-400/60 transition hover:bg-cyan-500/30 dark:hover:bg-cyan-500/30 hover:bg-blue-200/80 hover:scale-105"
            title="Zoom In"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>
      )}

      {/* Color indicator dots */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {colorVariants.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i)
              // Calculate rotation needed to reach this index
              const currentRot = ringRotation
              const targetCardAngle = (i * (Math.PI * 2)) / colorVariants.length
              const currentCardAngle = (currentIndex * (Math.PI * 2)) / colorVariants.length
              const rotationDiff = currentCardAngle - targetCardAngle
              setRingRotation(currentRot + rotationDiff)
            }}
            className={`h-2 rounded-full transition-all ${
              i === currentIndex
                ? 'w-8 bg-cyan-400'
                : 'w-2 bg-cyan-400/30 hover:bg-cyan-400/50'
            }`}
          />
        ))}
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        categories={[]}
        onSave={(updatedProduct) => {
          // Update the product data
          setProductData(updatedProduct)
          setIsEditModalOpen(false)
        }}
      />

      {/* Color Management Modal */}
      <ColorManagementModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        initialColors={colorVariants}
        onSave={handleSaveColors}
      />

      {/* Glass Shatter Effect */}
      {showShatterEffect && (
        <GlassShatterEffect
          onComplete={() => setShowShatterEffect(false)}
          centerX={50}
          centerY={50}
        />
      )}
    </div>
  )
}
