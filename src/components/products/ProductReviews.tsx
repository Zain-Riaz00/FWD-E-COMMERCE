import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'
import type { Review, ReviewReply } from '@/types/product'
import VerifiedBadge from '@/components/ui/VerifiedBadge'

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  onAddReview: (review: Omit<Review, 'id' | 'createdAt' | 'replies'>) => void
  onAddReply: (reviewId: string, reply: Omit<ReviewReply, 'id' | 'createdAt'>) => void
}

export default function ProductReviews({ productId, reviews, onAddReview, onAddReply }: ProductReviewsProps) {
  const { isAdmin } = useAdmin()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [userName, setUserName] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyUserName, setReplyUserName] = useState('')
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0
  
  function handleSubmitReview() {
    if (!userName.trim() || !comment.trim()) {
      alert('Please enter your name and comment')
      return
    }
    
    onAddReview({
      productId,
      userName: userName.trim(),
      userId: `user-${Date.now()}`,
      rating,
      comment: comment.trim(),
    })
    
    setComment('')
    setUserName('')
    setRating(5)
  }
  
  function handleSubmitReply(reviewId: string) {
    if (!replyUserName.trim() || !replyText.trim()) {
      alert('Please enter your name and reply')
      return
    }
    
    onAddReply(reviewId, {
      userName: replyUserName.trim(),
      userId: isAdmin ? 'admin' : `user-${Date.now()}`,
      isAdmin,
      comment: replyText.trim(),
    })
    
    setReplyText('')
    setReplyUserName('')
    setReplyingTo(null)
  }
  
  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/20">
        <div className="text-center">
          <div className="text-4xl font-bold text-cyan-100">{averageRating.toFixed(1)}</div>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-cyan-300/70 mt-1">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter(r => r.rating === star).length
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-cyan-300/70 w-8">{star}★</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-cyan-300/70 w-8">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Add Review Form */}
      <div className="p-6 bg-black/40 rounded-xl border border-cyan-400/20">
        <h3 className="text-lg font-semibold text-cyan-100 mb-4">Write a Review</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-100 mb-2">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-cyan-100 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate ${star} out of 5 stars`}
                  title={`Rate ${star} out of 5 stars`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-cyan-100 mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
              rows={4}
              placeholder="Share your experience with this product..."
            />
          </div>
          
          <button
            type="button"
            onClick={handleSubmitReview}
            className="w-full px-4 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-all flex items-center justify-center gap-2"
            aria-label="Submit review"
          >
            <Send className="w-4 h-4" />
            Submit Review
          </button>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-cyan-100">Customer Reviews</h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-cyan-400/50">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 bg-black/40 rounded-xl border border-cyan-400/20"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-cyan-100">{review.userName}</h4>
                      {review.userId === 'admin' && <VerifiedBadge size="sm" />}
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-cyan-300/50">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Review Comment */}
                <p className="text-cyan-100/80 mb-4">{review.comment}</p>
                
                {/* Replies */}
                {review.replies && review.replies.length > 0 && (
                  <div className="ml-6 space-y-3 mb-4 border-l-2 border-cyan-400/20 pl-4">
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="bg-black/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-cyan-100">{reply.userName}</span>
                          {reply.isAdmin && <VerifiedBadge size="sm" />}
                          <span className="text-xs text-cyan-300/50">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-cyan-100/70 text-sm">{reply.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Reply Button */}
                {replyingTo === review.id ? (
                  <div className="ml-6 space-y-3">
                    <input
                      type="text"
                      value={replyUserName}
                      onChange={(e) => setReplyUserName(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                      placeholder="Your name"
                    />
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none text-sm"
                      rows={3}
                      placeholder="Write a reply..."
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="px-4 py-2 text-sm border border-cyan-400/30 rounded-lg text-cyan-100 hover:bg-white/5 transition-all"
                        aria-label="Cancel reply"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmitReply(review.id)}
                        className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all flex items-center gap-2"
                        aria-label="Send reply"
                      >
                        <Send className="w-3 h-3" />
                        Send Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReplyingTo(review.id)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    aria-label="Reply to review"
                  >
                    Reply
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
