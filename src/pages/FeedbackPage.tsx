import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageSquare, Star, Search, Reply, RefreshCw, CheckCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/contexts/AdminContext'
import { reviewAPI, feedbackAPI } from '@/services/api'

interface Review {
  _id: string
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

interface FeedbackItem {
  _id: string
  userName: string
  userEmail: string
  type: 'contact' | 'feedback' | 'complaint' | 'suggestion'
  subject?: string
  message: string
  status: 'pending' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  adminReply?: string
  repliedAt?: string
  createdAt: string
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400', icon: RefreshCw },
  resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400', icon: CheckCircle }
}

export default function FeedbackPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAdmin()
  const [activeTab, setActiveTab] = useState<'reviews' | 'feedback'>('reviews')
  const [reviews, setReviews] = useState<Review[]>([])
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'resolved'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    loadData()
  }, [isAdmin, navigate])

  async function loadData() {
    setLoading(true)
    try {
      const [reviewsData, feedbackData] = await Promise.all([
        reviewAPI.getAll(),
        feedbackAPI.getAll()
      ])
      setReviews(reviewsData as Review[])
      setFeedbackItems(feedbackData as FeedbackItem[])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (filter !== 'all' && review.status !== filter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return review.productName?.toLowerCase().includes(query) ||
             review.userName.toLowerCase().includes(query) ||
             review.comment.toLowerCase().includes(query)
    }
    return true
  })

  const filteredFeedback = feedbackItems.filter(item => {
    if (filter !== 'all') {
      if (filter === 'pending' && item.status !== 'pending') return false
      if (filter === 'resolved' && item.status !== 'resolved') return false
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return item.userName.toLowerCase().includes(query) ||
             item.message.toLowerCase().includes(query) ||
             item.subject?.toLowerCase().includes(query)
    }
    return true
  })

  const handleReviewReply = async () => {
    if (!selectedReview || !replyText.trim()) return
    
    const result = await reviewAPI.reply(selectedReview._id, replyText)
    if (result) {
      setReviews(prev => prev.map(r => 
        r._id === selectedReview._id ? { ...r, replied: true, replyText } : r
      ))
      setSelectedReview(null)
      setReplyText('')
    }
  }

  const handleFeedbackReply = async () => {
    if (!selectedFeedback || !replyText.trim()) return
    
    const result = await feedbackAPI.reply(selectedFeedback._id, replyText, 'resolved')
    if (result) {
      setFeedbackItems(prev => prev.map(f => 
        f._id === selectedFeedback._id ? { ...f, adminReply: replyText, status: 'resolved' as const } : f
      ))
      setSelectedFeedback(null)
      setReplyText('')
    }
  }

  const handleStatusChange = async (reviewId: string, status: 'approved' | 'rejected') => {
    const result = await reviewAPI.updateStatus(reviewId, status)
    if (result) {
      setReviews(prev => prev.map(r => 
        r._id === reviewId ? { ...r, status } : r
      ))
    }
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
            Feedback & Reviews
          </h1>
          <p className="text-cyan-200/70">Manage customer reviews and feedback messages</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-400/30 rounded-lg text-purple-300 hover:bg-purple-500/20 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'reviews'
              ? 'bg-purple-500/20 text-purple-100 ring-1 ring-purple-400/40'
              : 'text-purple-200/70 hover:bg-purple-500/10'
          }`}
        >
          <Star className="w-4 h-4 inline mr-2" />
          Product Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'feedback'
              ? 'bg-purple-500/20 text-purple-100 ring-1 ring-purple-400/40'
              : 'text-purple-200/70 hover:bg-purple-500/10'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Contact Messages ({feedbackItems.length})
        </button>
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
        <div className="flex items-center gap-2 bg-black/30 rounded-lg p-1 border border-purple-400/20">
          {(['all', 'pending', activeTab === 'reviews' ? 'approved' : 'resolved', activeTab === 'reviews' ? 'rejected' : null].filter(Boolean) as string[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-purple-500/30 text-purple-100 shadow-lg'
                  : 'text-gray-400 hover:text-purple-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/30 border border-purple-400/20 rounded-lg text-purple-100 placeholder-purple-200/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-white/60 mt-4">Loading...</p>
        </div>
      ) : activeTab === 'reviews' ? (
        /* Reviews List */
        filteredReviews.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 p-12 rounded-2xl border border-white/10 text-center">
            <Star className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No reviews found</p>
            <p className="text-white/40 text-sm mt-2">Reviews will appear here when customers submit them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="backdrop-blur-xl bg-white/5 p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{review.productName || 'Product Review'}</h3>
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
                          onClick={() => handleStatusChange(review._id, 'approved')}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(review._id, 'rejected')}
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
        )
      ) : (
        /* Feedback List */
        filteredFeedback.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 p-12 rounded-2xl border border-white/10 text-center">
            <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No feedback messages found</p>
            <p className="text-white/40 text-sm mt-2">Contact messages will appear here when customers submit them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item, index) => {
              const StatusIcon = statusConfig[item.status]?.icon || Clock
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="backdrop-blur-xl bg-white/5 p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{item.subject || item.type.charAt(0).toUpperCase() + item.type.slice(1)}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[item.status]?.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[item.status]?.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-white/70 mb-3">{item.message}</p>
                      <div className="flex items-center gap-4 text-sm text-white/50">
                        <span>{item.userName}</span>
                        <span>•</span>
                        <span>{item.userEmail}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {item.adminReply && (
                        <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border-l-2 border-purple-400">
                          <p className="text-sm text-purple-200">Your reply: {item.adminReply}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {item.status !== 'resolved' && (
                        <button
                          onClick={() => setSelectedFeedback(item)}
                          className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-all flex items-center gap-1"
                        >
                          <Reply className="w-4 h-4" />
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )
      )}

      {/* Reply Modal for Reviews */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0e1a] rounded-xl border border-purple-500/30 p-6 max-w-lg w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Reply to Review</h3>
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {renderStars(selectedReview.rating)}
              </div>
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
                onClick={handleReviewReply}
                disabled={!replyText.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Reply
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reply Modal for Feedback */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0e1a] rounded-xl border border-purple-500/30 p-6 max-w-lg w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Reply to Feedback</h3>
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium text-sm mb-2">{selectedFeedback.subject || 'No Subject'}</p>
              <p className="text-white/70 text-sm">{selectedFeedback.message}</p>
              <p className="text-white/50 text-xs mt-2">- {selectedFeedback.userName} ({selectedFeedback.userEmail})</p>
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
                  setSelectedFeedback(null)
                  setReplyText('')
                }}
                className="flex-1 px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackReply}
                disabled={!replyText.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Reply & Resolve
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
