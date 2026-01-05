import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageSquare, Star, Search, Reply } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/contexts/AdminContext'

interface Review {
  id: string
  productId: string
  productName: string
  userName: string
  userEmail: string
  rating: number
  comment: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
  replied: boolean
  replyText?: string
}

// Cache for reviews
let cachedReviews: Review[] | null = null

export default function FeedbackPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAdmin()
  const [reviews, setReviews] = useState<Review[]>(cachedReviews || [])
  const [loading, setLoading] = useState(cachedReviews === null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    if (cachedReviews === null) {
      loadReviews()
    }
  }, [isAdmin, navigate])

  async function loadReviews() {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/reviews')
      if (response.ok) {
        const data = await response.json()
        cachedReviews = data
        setReviews(data)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      // Use mock data for now
      const mockReviews: Review[] = [
        {
          id: '1',
          productId: 'prod1',
          productName: 'Gaming Headset Pro',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          rating: 5,
          comment: 'Excellent sound quality and very comfortable for long gaming sessions!',
          createdAt: new Date().toISOString(),
          status: 'approved',
          replied: false
        },
        {
          id: '2',
          productId: 'prod2',
          productName: 'RGB Gaming Mouse',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          rating: 4,
          comment: 'Great mouse but the software could be better.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'pending',
          replied: false
        }
      ]
      cachedReviews = mockReviews
      setReviews(mockReviews)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (filter !== 'all' && review.status !== filter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return review.productName.toLowerCase().includes(query) ||
             review.userName.toLowerCase().includes(query) ||
             review.comment.toLowerCase().includes(query)
    }
    return true
  })

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return
    
    try {
      // Update locally
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, replied: true, replyText } : r
      ))
      cachedReviews = reviews.map(r => 
        r.id === reviewId ? { ...r, replied: true, replyText } : r
      )
      setSelectedReview(null)
      setReplyText('')
    } catch (error) {
      console.error('Error replying to review:', error)
    }
  }

  const handleStatusChange = async (reviewId: string, status: 'approved' | 'rejected') => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, status } : r
    ))
    cachedReviews = reviews.map(r => 
      r.id === reviewId ? { ...r, status } : r
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
          />
        ))}
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen pt-16 pb-12 w-full px-4 sm:px-6 lg:px-8 bg-[#050810]">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-cyan-200/70 hover:text-cyan-100 transition-colors mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
          Feedback & Reviews
        </h1>
        <p className="text-cyan-200/70">Manage customer reviews and feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
          <p className="text-white/60 text-xs">Total Reviews</p>
          <p className="text-2xl font-bold text-white">{reviews.length}</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30">
          <p className="text-white/60 text-xs">Pending</p>
          <p className="text-2xl font-bold text-white">{reviews.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
          <p className="text-white/60 text-xs">Approved</p>
          <p className="text-2xl font-bold text-white">{reviews.filter(r => r.status === 'approved').length}</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-xl border border-cyan-500/30">
          <p className="text-white/60 text-xs">Avg Rating</p>
          <p className="text-2xl font-bold text-white">
            {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 bg-black/30 rounded-lg p-1 border border-cyan-400/20">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-cyan-500/30 text-cyan-100 shadow-lg'
                  : 'text-gray-400 hover:text-cyan-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/50" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-cyan-100 placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-white/60 mt-4">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 p-12 rounded-2xl border border-white/10 text-center">
          <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 text-lg">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{review.productName}</h3>
                    {renderStars(review.rating)}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      review.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      review.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {review.status}
                    </span>
                  </div>
                  <p className="text-white/70 mb-3">{review.comment}</p>
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <span>{review.userName}</span>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    {review.replied && (
                      <>
                        <span>•</span>
                        <span className="text-green-400">Replied</span>
                      </>
                    )}
                  </div>
                  
                  {review.replyText && (
                    <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border-l-2 border-purple-400">
                      <p className="text-sm text-purple-200">Your reply: {review.replyText}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(review.id, 'approved')}
                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(review.id, 'rejected')}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {!review.replied && (
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-all flex items-center gap-1"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0e1a] rounded-xl border border-purple-500/30 p-6 max-w-lg w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Reply to Review</h3>
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <p className="text-white/70 text-sm">{selectedReview.comment}</p>
              <p className="text-white/50 text-xs mt-2">- {selectedReview.userName}</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              className="w-full px-4 py-3 bg-black/30 border border-purple-400/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setSelectedReview(null)
                  setReplyText('')
                }}
                className="flex-1 px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReply(selectedReview.id)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Send Reply
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
