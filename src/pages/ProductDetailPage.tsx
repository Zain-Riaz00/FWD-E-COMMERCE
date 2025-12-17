import { useMemo, useState, useEffect } from 'react'
import QuantitySelector from '@/components/products/QuantitySelector'
import ProductReviews from '@/components/products/ProductReviews'
import type { Product, Review, ReviewReply } from '@/types/product'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import { useAdmin } from '@/contexts/AdminContext'
import { StarRating } from '@/components/ui/StarRating'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit2 } from 'lucide-react'
import EditProductModal from '@/components/admin/EditProductModal'
import { productAPI } from '@/services/api'

// Helper to calculate average rating
function getAverageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export default function ProductDetailPage() {
  const { addItem } = useCart()
  const { isAdmin } = useAdmin()
  const navigate = useNavigate()
  const { id } = useParams()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [productData, setProductData] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return
      setLoading(true)
      const product = await productAPI.getById(id)
      if (product) {
        setProductData(product)
        
        // Load reviews from database first (gallery view)
        try {
          const response = await fetch(`http://localhost:5000/api/reviews/product/${id}?viewType=gallery`)
          if (response.ok) {
            const data = await response.json()
            if (data && data.length > 0) {
              setReviews(data)
              // Update localStorage with DB data
              localStorage.setItem(`reviews-${id}-gallery`, JSON.stringify(data));
            } else {
              // No reviews in DB, try localStorage
              const savedReviews = localStorage.getItem(`reviews-${id}-gallery`)
              if (savedReviews) {
                const parsedReviews = JSON.parse(savedReviews)
                setReviews(parsedReviews)
              }
            }
          } else {
            // DB request failed, use localStorage
            const savedReviews = localStorage.getItem(`reviews-${id}-gallery`)
            if (savedReviews) {
              const parsedReviews = JSON.parse(savedReviews)
              setReviews(parsedReviews)
            }
          }
        } catch (error) {
          console.error('Error loading gallery reviews:', error)
          // Fallback to localStorage
          const savedReviews = localStorage.getItem(`reviews-${id}-gallery`)
          if (savedReviews) {
            const parsedReviews = JSON.parse(savedReviews)
            setReviews(parsedReviews)
          }
        }
      }
      setLoading(false)
    }
    loadProduct()
  }, [id])
  
  const images = useMemo(
    () => productData ? [
      productData.imageUrl,
      'https://picsum.photos/seed/detail-2/1024/1024',
      'https://picsum.photos/seed/detail-3/1024/1024',
      'https://picsum.photos/seed/detail-4/1024/1024',
    ] : [],
    [productData],
  )
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState<number>(1)
  const activeUrl = images[active]

  if (loading) {
    return (
      <section className="container pt-16 py-10">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-200">Loading product...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!productData) {
    return (
      <section className="container pt-16 py-10">
        <div className="text-center py-20">
          <p className="text-cyan-200">Product not found</p>
          <button onClick={() => navigate('/products')} className="mt-4 text-cyan-400 hover:text-cyan-300">Back to Products</button>
        </div>
      </section>
    )
  }

  return (
    <section className="container pt-16 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-cyan-200/70 hover:text-cyan-100 transition-colors group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </button>

      <div className="grid gap-10 md:grid-cols-[3fr_2fr]">
        {/* Left: 60% media */}
        <div>
          <div className="mb-3 overflow-hidden rounded-xl bg-gradient-to-br from-[#0a0e1a]/60 to-[#020304]/60 ring-1 ring-inset ring-cyan-400/10 backdrop-blur-sm">
            <img src={activeUrl} alt={productData.name} className="aspect-square w-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.map((url, i) => (
              <button
                key={url}
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-lg ring-1 ring-inset transition ${
                  i === active ? 'ring-zinc-200' : 'ring-zinc-800 hover:ring-zinc-600'
                }`}
                aria-label={`Thumbnail ${i + 1}`}
              >
                <img src={url} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: 40% details */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold tracking-tight flex-1">{productData.name}</h1>
            {isAdmin && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/30 text-blue-100 ring-1 ring-blue-400/50 hover:bg-blue-500/40 transition-all"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          <div className="mb-3 flex items-center gap-2">
            <StarRating value={getAverageRating(reviews)} />
            <span className="text-sm text-zinc-400">{getAverageRating(reviews).toFixed(1)}</span>
            <span className="text-xs text-cyan-400/60">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>
          <p className="mb-6 max-w-prose text-zinc-400">{productData.description}</p>

          {/* Leave a review button */}
          <div className="mb-4">
            <Link
              to={`/comment/${id}/gallery`}
              className="inline-block px-4 py-2 rounded bg-cyan-500/30 text-cyan-100 font-semibold hover:bg-cyan-500/50 transition text-sm"
            >
              Leave a Comment or Review
            </Link>
          </div>

          <div className="mb-4 text-2xl font-semibold">Rs. {productData.price.toFixed(2)}</div>

          <div className="mb-6 flex items-center gap-3">
            <QuantitySelector min={1} max={10} onChange={setQty} />
            <Button className="h-10 px-4" onClick={() => addItem(productData, qty)}>Add to cart</Button>
            <Button className="h-10 px-4" onClick={() => addItem(productData, qty)}>Shop Now</Button>
          </div>

          <div className="space-y-2 text-sm text-zinc-400">
            <p>Rating: {getAverageRating(reviews).toFixed(1)} / 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</p>
            <p>Free shipping on orders over Rs. 10,000</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <ProductReviews
          productId={id || productData.id}
          reviews={reviews}
          onAddReview={(review) => {
            const newReview: Review = {
              ...review,
              id: `review-${Date.now()}`,
              createdAt: new Date().toISOString(),
              replies: [],
            }
            
            const updatedReviews = [...reviews, newReview]
            setReviews(updatedReviews)
            localStorage.setItem(`reviews-${id || productData.id}`, JSON.stringify(updatedReviews))
            
            // Update product rating
            const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
            setProductData(prev => prev ? { ...prev, rating: avgRating, reviewCount: updatedReviews.length } : null)
          }}
          onAddReply={(reviewId, reply) => {
            const newReply: ReviewReply = {
              ...reply,
              id: `reply-${Date.now()}`,
              createdAt: new Date().toISOString(),
            }
            
            const updatedReviews = reviews.map(review =>
              review.id === reviewId
                ? { ...review, replies: [...(review.replies || []), newReply] }
                : review
            )
            
            setReviews(updatedReviews)
            localStorage.setItem(`reviews-${id || productData.id}`, JSON.stringify(updatedReviews))
          }}
        />
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={productData}
        onSave={async (updatedProduct) => {
          if (updatedProduct._id) {
            await productAPI.update(updatedProduct._id, updatedProduct)
            setProductData(updatedProduct)
          }
          setIsEditModalOpen(false)
        }}
      />
    </section>
  )
}
