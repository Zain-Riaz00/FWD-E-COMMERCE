import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Trash2, ThumbsUp, MessageCircle } from 'lucide-react';
import type { Review, Comment } from '@/types/product';
import { appendGlobalNotification } from '@/utils/notificationFeed';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

// Helper to get user profile name from localStorage
function getProfileData() {
  const profile = localStorage.getItem('userProfile');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  if (profile) {
    try {
      const parsed = JSON.parse(profile);
      return { 
        ...parsed, 
        isAdmin,
        email: parsed.email || 'user@example.com'
      };
    } catch {
      return { name: 'User', email: 'user@example.com', profilePic: '', isAdmin };
    }
  }
  return { name: 'User', email: 'user@example.com', profilePic: '', isAdmin };
}

type ReplyNotification = {
  id: string;
  replier: string;
  to?: string;
  product: string;
  variant?: string;
  comment: string;
  createdAt: string;
};

export default function CommentPage() {
  // Pagination for main comments
  const COMMENTS_PAGE_SIZE = 5;
  const [commentsShown, setCommentsShown] = useState<number>(COMMENTS_PAGE_SIZE);
  // For reply pagination: how many replies to show at once
  const REPLIES_PAGE_SIZE = 3;
  // Track which comments have expanded replies
  const [expandedReplies, setExpandedReplies] = useState<{ [id: string]: boolean }>({});
  // Track how many replies are shown for each comment
  const [repliesShown, setRepliesShown] = useState<{ [id: string]: number }>({});
  // Reply input state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  // Reply to reply state
  const [replyingToReply, setReplyingToReply] = useState<string | null>(null);
  const [replyToReplyText, setReplyToReplyText] = useState('');
  // Inline toasts for quick feedback + global feed storage
  const [inlineNotifications, setInlineNotifications] = useState<ReplyNotification[]>([]);

  const pushNotification = (payload: Omit<ReplyNotification, 'id' | 'createdAt'>) => {
    const notif: ReplyNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    setInlineNotifications(prev => [notif, ...prev].slice(0, 3));
    appendGlobalNotification({
      id: notif.id,
      type: 'reply',
      title: `@${notif.replier} replied${notif.to ? ` to ${notif.to}` : ''}`,
      message: notif.comment,
      timestamp: notif.createdAt,
      meta: notif.variant ? `${notif.product} / ${notif.variant}` : notif.product,
      status: 'new',
    });
  };
  
  // Tabs: 'all' or 'mine'
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  // Star filter: 0 = all, 1-5 = filter by rating
  const [starFilter, setStarFilter] = useState<number>(0);

  const { id, viewType = 'gallery' } = useParams<{ id: string; viewType: 'gallery' | 'immersive' }>(); // id = variant id, viewType = gallery or immersive
  // Get product image for this variant
  const [productImage, setProductImage] = useState<string | null>(null);
  const [userExistingRating, setUserExistingRating] = useState<number>(0); // User's previous rating

  useEffect(() => {
    if (!id) return;
    // Try to get variant image from localStorage (product-variants-{mainProductId})
    const parts = id.split('-');
    let mainProductId = parts[0];
    if (parts[0] === 'variant' && parts.length >= 2) {
      mainProductId = parts[1];
    }
    const variantsKey = `product-variants-${mainProductId}`;
    const storedVariants = localStorage.getItem(variantsKey);
    if (storedVariants) {
      try {
        const variants = JSON.parse(storedVariants);
        const currentVariant = variants.find((v: any) => v.id === id);
        if (currentVariant) {
          if (currentVariant.imageUrl) setProductImage(currentVariant.imageUrl);
          return;
        }
      } catch {}
    }
    // fallback: placeholder
    import('@/utils/placeholderImages').then(mod => {
      setProductImage(mod.getProductPlaceholder(id));
    });
  }, [id]);

  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]); // User ratings (stars only)
  const [comments, setComments] = useState<Comment[]>([]); // User comments (separate)
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [showComments, setShowComments] = useState(false); // Control comments section visibility
  const [sessionCommentIds, setSessionCommentIds] = useState<string[]>([]); // Track comments added in THIS session only
  const profileData = getProfileData();


  useEffect(() => {
    if (!id || !viewType) return;
    // Load reviews (ratings) from database filtered by viewType
    const loadReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/product/${id}?viewType=${viewType}`)
        if (response.ok) {
          const data = await response.json()
          console.log(`Loaded ${viewType} reviews (ratings) from DB:`, data)
          setReviews(data || [])
        }
      } catch (error) {
        console.error('Error loading reviews:', error)
        setReviews([])
      }
    }
    loadReviews()
  }, [id, viewType]);

  // Load comments separately from database
  useEffect(() => {
    if (!id || !viewType) return;
    const loadComments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/comments/product/${id}?viewType=${viewType}`)
        if (response.ok) {
          const data = await response.json()
          console.log(`Loaded ${viewType} comments from DB:`, data)
          setComments(data || [])
        }
      } catch (error) {
        console.error('Error loading comments:', error)
        setComments([])
      }
    }
    loadComments()
  }, [id, viewType]);

  // Load user's existing rating for this product+viewType
  useEffect(() => {
    if (!id || !viewType || !profileData.email) return;
    
    const loadUserRating = async () => {
      try {
        const userId = encodeURIComponent(profileData.email)
        const response = await fetch(`http://localhost:5000/api/reviews/user-rating/${id}/${userId}/${viewType}`)
        if (response.ok) {
          const data = await response.json()
          if (data.rating > 0) {
            setUserExistingRating(data.rating)
            setRating(data.rating) // Pre-fill the stars
            console.log(`User's existing ${viewType} rating:`, data.rating)
          }
        }
      } catch (error) {
        console.error('Error loading user rating:', error)
      }
    }
    
    loadUserRating()
  }, [id, viewType, profileData.email]);

  useEffect(() => {
    if (inlineNotifications.length === 0) return;
    const timer = setTimeout(() => {
      setInlineNotifications(prev => prev.slice(0, Math.max(prev.length - 1, 0)));
    }, 4000);
    return () => clearTimeout(timer);
  }, [inlineNotifications]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Need at least rating OR comment
    if (rating === 0 && !comment.trim()) return;
    
    // Handle rating submission (if stars selected)
    if (rating > 0) {
      const ratingData = {
        productId: id!,
        userName: profileData.name,
        userId: profileData.email || Date.now().toString(),
        userEmail: profileData.email || 'user@example.com',
        rating,
        viewType: viewType as 'gallery' | 'immersive',
      };
      
      fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save rating');
        return res.json();
      })
      .then(savedReview => {
        // Update reviews list
        const existingIndex = reviews.findIndex(r => r.userId === profileData.email);
        let updatedReviews;
        if (existingIndex >= 0) {
          updatedReviews = [...reviews];
          updatedReviews[existingIndex] = savedReview;
        } else {
          updatedReviews = [savedReview, ...reviews];
        }
        setReviews(updatedReviews);
        setUserExistingRating(rating);
      })
      .catch(error => {
        console.error('Error saving rating:', error);
      });
    }
    
    // Handle comment submission (if comment text provided)
    if (comment.trim()) {
      const commentData = {
        id: Date.now().toString(),
        productId: id!,
        userName: profileData.name,
        userId: profileData.email || Date.now().toString(),
        userEmail: profileData.email || 'user@example.com',
        comment,
        viewType: viewType as 'gallery' | 'immersive',
        createdAt: new Date().toISOString(),
        profilePic: profileData.profilePic || '',
        likes: 0,
        likedBy: []
      };
      
      fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save comment');
        return res.json();
      })
      .then(savedComment => {
        // Add comment to list and track it as a session comment
        setComments(prevComments => [savedComment, ...prevComments]);
        setSessionCommentIds(prev => [savedComment.id, ...prev]); // Track this session's comments
        setComment('');
      })
      .catch(error => {
        console.error('Error saving comment:', error);
        // Fallback to local state
        const tempId = commentData.id;
        setComments(prevComments => [commentData, ...prevComments]);
        setSessionCommentIds(prev => [tempId, ...prev]);
        setComment('');
      });
    }
  }
  // Helper: get current user name from profile
  const currentUserName = profileData.name;

  // Memoized filtered reviews for performance - MUST be at top level
  const filteredReviews = useMemo(() => {
    let result = reviews;
    if (tab === 'mine') result = result.filter(r => r.userName === currentUserName);
    if (starFilter) result = result.filter(r => r.rating === starFilter);
    return result;
  }, [reviews, tab, starFilter, currentUserName]);

  // Memoized filtered comments
  const filteredComments = useMemo(() => {
    // First, filter out replies - we only want top-level comments here
    let result = comments.filter(c => !c.parentCommentId);
    
    console.log('Filter Debug:', {
      showComments,
      sessionCommentIds,
      totalComments: comments.length,
      topLevelComments: result.length,
      allCommentIds: comments.map(c => c.id).slice(0, 5) // Only show first 5 for brevity
    });
    
    // When 'See All Comments' is NOT clicked, show ONLY comments added in THIS session
    if (!showComments) {
      // CRITICAL: Filter to ONLY comments whose IDs are in sessionCommentIds
      result = result.filter(c => {
        const isInSession = sessionCommentIds.includes(c.id);
        console.log(`Comment ${c.id}: in session? ${isInSession}`);
        return isInSession;
      });
      console.log('Filtered to session comments:', result.length, 'Expected:', sessionCommentIds.length);
    } else {
      // When 'See All Comments' IS clicked, apply tab filters
      if (tab === 'mine') result = result.filter(c => c.userName === currentUserName);
      // If star filter is active, only show comments from users with that rating
      if (starFilter) {
        const usersWithRating = reviews
          .filter(r => r.rating === starFilter)
          .map(r => r.userName);
        result = result.filter(c => usersWithRating.includes(c.userName));
      }
    }
    return result;
  }, [comments, tab, starFilter, reviews, currentUserName, showComments, sessionCommentIds]);

  // Delete review handler
  // Delete comment handler (also handles replies)
  function handleDeleteComment(idToDelete: string) {
    // Remove from session tracking first
    setSessionCommentIds(prev => prev.filter(id => id !== idToDelete));
    
    // Then delete from database and state
    fetch(`http://localhost:5000/api/comments/${idToDelete}`, {
      method: 'DELETE'
    })
    .then(() => {
      setComments(prevComments => prevComments.filter(c => c.id !== idToDelete));
    })
    .catch(error => {
      console.error('Error deleting comment:', error);
      // Still remove from state even if server delete fails
      setComments(prevComments => prevComments.filter(c => c.id !== idToDelete));
    });
  }

  // Like/Unlike comment handler
  async function handleLikeComment(commentId: string) {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profileData.email || profileData.name })
      });
      
      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  }

  // Submit reply to a comment
  async function handleSubmitReply(parentId: string) {
    if (!replyText.trim()) return;

    const replyData = {
      productId: id!,
      userName: profileData.name,
      userId: profileData.email || Date.now().toString(),
      userEmail: profileData.email || 'user@example.com',
      comment: replyText,
      viewType: viewType as 'gallery' | 'immersive',
      parentCommentId: parentId,
      profilePic: profileData.profilePic || '',
      likes: 0,
      likedBy: []
    };

    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData)
      });

      if (response.ok) {
        const savedReply = await response.json();
        setComments(prev => [savedReply, ...prev]);
        setReplyText('');
        setReplyingTo(null);
        // Auto-expand replies for this comment
        setExpandedReplies(prev => ({ ...prev, [parentId]: true }));
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  }

  // Submit reply to a reply
  async function handleSubmitReplyToReply(parentId: string) {
    if (!replyToReplyText.trim()) return;

    const replyData = {
      productId: id!,
      userName: profileData.name,
      userId: profileData.email || Date.now().toString(),
      userEmail: profileData.email || 'user@example.com',
      comment: replyToReplyText,
      viewType: viewType as 'gallery' | 'immersive',
      parentCommentId: parentId,
      profilePic: profileData.profilePic || '',
      likes: 0,
      likedBy: []
    };

    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData)
      });

      if (response.ok) {
        const savedReply = await response.json();
        setComments(prev => [savedReply, ...prev]);
        setReplyToReplyText('');
        setReplyingToReply(null);
        // Auto-expand replies for this comment
        setExpandedReplies(prev => ({ ...prev, [parentId]: true }));
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  }

  // Get replies for a specific comment
  function getRepliesForComment(commentId: string): Comment[] {
    return comments.filter(c => c.parentCommentId === commentId).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  return (
    <>
      <div className="min-h-screen w-full flex flex-col bg-[#020817] text-cyan-100 p-4 sm:p-6">
      <div className="h-16"></div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cyan-200/70 hover:text-cyan-100 transition-colors mb-6 group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
        <span>Back</span>
      </button>
      {productImage && (
        <div className="w-32 h-32 sm:w-40 sm:h-40 mb-4 mx-auto flex items-center justify-center">
          <img src={productImage} alt="Product" className="object-cover w-full h-full rounded-xl shadow-lg border border-cyan-900/40" />
        </div>
      )}
      <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl bg-black/60 rounded-xl p-2 sm:p-6 shadow-lg mx-auto flex-1 flex flex-col">
        <h2 className="text-2xl font-bold mb-2 text-cyan-100">
          Reviews & Feedbacks
        </h2>
        <p className="text-xs text-cyan-300/60 mb-3">
          ⭐ Please Rate Us • 💬  Drop Suggestion (if any)
        </p>
        <p className="text-sm font-medium text-cyan-200/80 mb-1">({viewType === 'gallery' ? 'Rating the ' : 'Immersive'} Category)</p>
        {userExistingRating > 0 && (
          <p className="text-xs text-cyan-300/70 mb-3">
            You've rated this {userExistingRating} stars. You can update your rating or add more comments below.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(n => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                className="focus:outline-none"
              >
                <svg
                  className={`h-8 w-8 ${n <= rating ? 'text-yellow-400' : 'text-cyan-700'}`}
                  fill={n <= rating ? 'currentColor' : 'none'}
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
              </button>
            ))}
            <span className="ml-2 text-cyan-200 text-sm">{rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : 'Select rating'}</span>
          </div>
          <textarea
            className="w-full rounded bg-cyan-900/30 p-2 text-cyan-100 placeholder:text-cyan-400/40"
            rows={3}
            placeholder="Write your comment (optional if rating)..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button type="submit" className="w-full py-2 rounded bg-cyan-500/30 text-cyan-100 font-semibold hover:bg-cyan-500/50 transition">
            {userExistingRating > 0 && rating !== userExistingRating ? 'Update' : 'Submit'}
          </button>
        </form>
        
        {/* User's own comments - show before See All Comments button */}
        {!showComments && filteredComments.length > 0 && (
          <div className="mt-6">
            <div className="space-y-2">
              {filteredComments.map(c => {
                const userRating = reviews.find(r => r.userName === c.userName);
                return (
                  <div key={c.id} className="rounded bg-cyan-900/20 px-3 py-3 text-cyan-100 flex gap-3">
                    {c.profilePic ? (
                      <img src={c.profilePic} alt={c.userName} className="h-10 w-10 rounded-full object-cover border border-cyan-400/20 flex-shrink-0" />
                    ) : (
                      <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cyan-700/30 flex-shrink-0">
                        <User className="h-5 w-5 text-cyan-300" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-cyan-200">{c.userName}</span>
                          {(c.isVerified || (profileData.isAdmin && c.userName === profileData.name)) && <VerifiedBadge size="sm" />}
                        </div>
                        {userRating && (
                          <span className="text-yellow-400 text-xs">{'★'.repeat(userRating.rating)}{'☆'.repeat(5 - userRating.rating)}</span>
                        )}
                        <span className="text-cyan-400/30 text-xs ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-1 rounded hover:bg-red-500/20 text-cyan-400/50 hover:text-red-400 transition flex-shrink-0"
                          title="Delete your comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-cyan-100 text-base leading-relaxed">{c.comment}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* See All Comments Button - only show if not currently visible */}
        {!showComments && comments.length > 0 && (
          <button
            onClick={() => setShowComments(true)}
            className="mt-6 text-cyan-200 hover:text-cyan-100 transition-colors text-sm font-medium"
          >
            See All Comments ({comments.length})
          </button>
        )}

        {/* Comments section - show if user clicked button OR just submitted */}
        {showComments && (
        <div className="mt-6">
          {/* Hide Comments Button */}
          <button
            onClick={() => setShowComments(false)}
            className="mb-4 text-cyan-200 hover:text-cyan-100 transition-colors text-sm font-medium"
          >
            Hide Comments
          </button>
          
          {/* Tabs for All Comments / My Comments */}
          <div className="flex gap-1 mb-2 items-center text-xs">
            <button onClick={() => setTab('all')} className={`px-2 py-0.5 rounded font-semibold ${tab === 'all' ? 'bg-cyan-700 text-cyan-100' : 'bg-cyan-900/30 text-cyan-400'}`}>All</button>
            <button onClick={() => setTab('mine')} className={`px-2 py-0.5 rounded font-semibold ${tab === 'mine' ? 'bg-cyan-700 text-cyan-100' : 'bg-cyan-900/30 text-cyan-400'}`}>My</button>
            <span className="ml-2 text-cyan-400">|</span>
            <span className="ml-2 text-cyan-400">Filter:</span>
            {[5,4,3,2,1].map(star => (
              <button
                key={star}
                onClick={() => setStarFilter(starFilter === star ? 0 : star)}
                className={`px-1.5 py-0.5 rounded transition-all duration-150 font-semibold text-yellow-400
                  ${starFilter === star ? 'scale-110 shadow-lg bg-yellow-400/10 ring-2 ring-yellow-400/60 text-yellow-400 z-10' : 'hover:bg-yellow-400/10'}`}
              >
                {star}★
              </button>
            ))}
            <button
              onClick={() => setStarFilter(0)}
              className={`px-1.5 py-0.5 rounded transition-all duration-150 font-semibold text-cyan-400
                ${starFilter === 0 ? 'scale-110 shadow-lg bg-cyan-400/10 ring-2 ring-cyan-400/60 text-cyan-400 z-10' : 'hover:bg-cyan-400/10'}`}
            >
              All
            </button>
            <span className="ml-auto text-cyan-300 font-bold">
              {reviews.length} Rating{reviews.length !== 1 ? 's' : ''} • {comments.length} Comment{comments.length !== 1 ? 's' : ''}
            </span>
          </div>
          {/* Delete all my comments button */}
          {tab === 'mine' && (filteredReviews.length > 0 || filteredComments.length > 0) && (filteredReviews.some(r => r.userName === currentUserName) || filteredComments.some(c => c.userName === currentUserName)) && (
            <button
              onClick={async () => {
                if (window.confirm('Delete all your comments and ratings?')) {
                  // Delete all user's reviews
                  const userReviews = filteredReviews.filter(r => r.userName === currentUserName);
                  for (const r of userReviews) {
                    await fetch(`http://localhost:5000/api/reviews/${r.id}`, { method: 'DELETE' }).catch(() => {});
                  }
                  setReviews(prevReviews => prevReviews.filter(r => r.userName !== currentUserName));
                  
                  // Delete all user's comments
                  const userComments = filteredComments.filter(c => c.userName === currentUserName);
                  for (const c of userComments) {
                    await fetch(`http://localhost:5000/api/comments/${c.id}`, { method: 'DELETE' }).catch(() => {});
                  }
                  setComments(prevComments => prevComments.filter(c => c.userName !== currentUserName));
                }
              }}
              className="mb-2 px-3 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/40 text-xs font-semibold transition"
            >
              Delete All My Comments & Ratings
            </button>
          )}
          {/* Filtered comments, paginated, no fixed height */}
          <div className="space-y-3">
            {filteredReviews.length === 0 && filteredComments.length === 0 ? (
              <p className="text-cyan-400/50 text-sm">No comments found.</p>
            ) : (
              <>
                {/* Comments Section - Display paginated comments */}
                {filteredComments.slice(0, commentsShown).map(c => {
                  // Find the user's rating for this product
                  const userRating = reviews.find(r => r.userName === c.userName);
                  const replies = getRepliesForComment(c.id);
                  const isLiked = c.likedBy?.includes(profileData.email || profileData.name);
                  const replyCount = replies.length;
                  const shownReplies = repliesShown[c.id] || REPLIES_PAGE_SIZE;
                  const hasMoreReplies = replyCount > shownReplies;
                  
                  return (
                    <div key={c.id} className="rounded bg-cyan-900/20 px-3 py-3 text-cyan-100 hover:bg-cyan-900/30 transition-colors">
                      <div className="flex gap-3">
                        {c.profilePic ? (
                          <img src={c.profilePic} alt={c.userName} className="h-10 w-10 rounded-full object-cover border border-cyan-400/20 flex-shrink-0" />
                        ) : (
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cyan-700/30 flex-shrink-0">
                            <User className="h-5 w-5 text-cyan-300" />
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-cyan-200">{c.userName}</span>
                              {(c.isVerified || (profileData.isAdmin && c.userName === profileData.name)) && <VerifiedBadge size="sm" />}
                            </div>
                            {userRating && (
                              <span className="text-yellow-400 text-xs">{'★'.repeat(userRating.rating)}{'☆'.repeat(5 - userRating.rating)}</span>
                            )}
                            <span className="text-cyan-400/30 text-xs ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                            {c.userName === currentUserName && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="p-1 rounded hover:bg-red-500/20 text-cyan-400/50 hover:text-red-400 transition flex-shrink-0"
                                title="Delete your comment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="text-cyan-100 text-base leading-relaxed mb-2">{c.comment}</div>
                          
                          {/* Like and Reply buttons */}
                          <div className="flex items-center gap-4 text-xs">
                            <button
                              onClick={() => handleLikeComment(c.id)}
                              className={`flex items-center gap-1 transition-colors ${
                                isLiked ? 'text-cyan-400' : 'text-cyan-400/50 hover:text-cyan-400'
                              }`}
                            >
                              <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-cyan-400' : ''}`} />
                              <span>{c.likes || 0}</span>
                            </button>
                            <button
                              onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                              className="flex items-center gap-1 text-cyan-400/50 hover:text-cyan-400 transition-colors"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>Reply</span>
                            </button>
                            {replyCount > 0 && (
                              <button
                                onClick={() => setExpandedReplies(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                                className="text-cyan-400/70 hover:text-cyan-400 transition-colors"
                              >
                                {expandedReplies[c.id] ? 'Hide' : 'Show'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                              </button>
                            )}
                          </div>

                          {/* Reply input */}
                          {replyingTo === c.id && (
                            <div className="mt-3 flex gap-2">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 px-3 py-1.5 rounded bg-cyan-950/50 border border-cyan-800/30 text-cyan-100 text-sm focus:outline-none focus:border-cyan-600/50"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmitReply(c.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleSubmitReply(c.id)}
                                className="px-3 py-1.5 rounded bg-cyan-600/30 text-cyan-200 hover:bg-cyan-600/50 transition text-sm font-medium"
                              >
                                Send
                              </button>
                            </div>
                          )}

                          {/* Replies section */}
                          {expandedReplies[c.id] && replies.length > 0 && (
                            <div className="mt-3 space-y-2 pl-4 border-l-2 border-cyan-800/30">
                              {replies.slice(0, shownReplies).map(reply => {
                                const replyLiked = reply.likedBy?.includes(profileData.email || profileData.name);
                                return (
                                  <div key={reply.id} className="flex gap-2">
                                    {reply.profilePic ? (
                                      <img src={reply.profilePic} alt={reply.userName} className="h-7 w-7 rounded-full object-cover border border-cyan-400/20 flex-shrink-0" />
                                    ) : (
                                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-cyan-700/30 flex-shrink-0">
                                        <User className="h-3.5 w-3.5 text-cyan-300" />
                                      </span>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-medium text-cyan-200 text-sm">{reply.userName}</span>
                                        {(reply.isVerified || (profileData.isAdmin && reply.userName === profileData.name)) && <VerifiedBadge size="sm" />}
                                        <span className="text-cyan-400/30 text-xs">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                        {reply.userName === currentUserName && (
                                          <button
                                            onClick={() => handleDeleteComment(reply.id)}
                                            className="p-0.5 rounded hover:bg-red-500/20 text-cyan-400/50 hover:text-red-400 transition ml-auto"
                                            title="Delete your reply"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-cyan-100 text-sm leading-relaxed mb-1">{reply.comment}</p>
                                      <div className="flex items-center gap-3 text-xs">
                                        <button
                                          onClick={() => handleLikeComment(reply.id)}
                                          className={`flex items-center gap-1 transition-colors ${
                                            replyLiked ? 'text-cyan-400' : 'text-cyan-400/50 hover:text-cyan-400'
                                          }`}
                                        >
                                          <ThumbsUp className={`h-3 w-3 ${replyLiked ? 'fill-cyan-400' : ''}`} />
                                          <span>{reply.likes || 0}</span>
                                        </button>
                                        <button
                                          onClick={() => setReplyingToReply(replyingToReply === reply.id ? null : reply.id)}
                                          className="text-cyan-400/50 hover:text-cyan-400 transition-colors"
                                        >
                                          Reply
                                        </button>
                                      </div>

                                      {/* Reply to reply input */}
                                      {replyingToReply === reply.id && (
                                        <div className="mt-2 flex gap-2">
                                          <input
                                            type="text"
                                            value={replyToReplyText}
                                            onChange={(e) => setReplyToReplyText(e.target.value)}
                                            placeholder={`Reply to ${reply.userName}...`}
                                            className="flex-1 px-2 py-1 rounded bg-cyan-950/50 border border-cyan-800/30 text-cyan-100 text-xs focus:outline-none focus:border-cyan-600/50"
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmitReplyToReply(c.id);
                                              }
                                            }}
                                          />
                                          <button
                                            onClick={() => handleSubmitReplyToReply(c.id)}
                                            className="px-2 py-1 rounded bg-cyan-600/30 text-cyan-200 hover:bg-cyan-600/50 transition text-xs font-medium"
                                          >
                                            Send
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {/* Show more replies button */}
                              {hasMoreReplies && (
                                <button
                                  onClick={() => setRepliesShown(prev => ({ ...prev, [c.id]: shownReplies + REPLIES_PAGE_SIZE }))}
                                  className="text-cyan-400/70 hover:text-cyan-400 text-xs transition-colors"
                                >
                                  Show more replies
                                </button>
                              )}
                              
                              {/* Hide replies button */}
                              {shownReplies > REPLIES_PAGE_SIZE && (
                                <button
                                  onClick={() => setRepliesShown(prev => ({ ...prev, [c.id]: REPLIES_PAGE_SIZE }))}
                                  className="text-cyan-400/70 hover:text-cyan-400 text-xs transition-colors ml-2"
                                >
                                  Hide replies
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          
          {/* Show More / Hide Comments buttons side by side */}
          <div className="mt-4 flex items-center justify-between gap-3">
            {filteredComments.length > commentsShown && (
              <button
                onClick={() => setCommentsShown(prev => prev + COMMENTS_PAGE_SIZE)}
                className="text-cyan-400/70 hover:text-cyan-400 transition-colors text-sm font-medium"
              >
                Show more comments
              </button>
            )}
            {filteredComments.length > COMMENTS_PAGE_SIZE && commentsShown > COMMENTS_PAGE_SIZE && (
              <button
                onClick={() => setCommentsShown(COMMENTS_PAGE_SIZE)}
                className="text-cyan-400/70 hover:text-cyan-400 transition-colors text-sm font-medium"
              >
                Show less
              </button>
            )}
            <button
              onClick={() => setShowComments(false)}
              className="ml-auto text-cyan-400/70 hover:text-cyan-400 transition-colors text-sm font-medium"
            >
              Hide comments
            </button>
          </div>
        </div>
        )}
      </div>
      </div>
      {inlineNotifications.length > 0 && (
        <div className="fixed top-6 right-6 z-50 flex w-72 flex-col gap-3">
          {inlineNotifications.map(notif => (
            <div key={notif.id} className="rounded-2xl border border-cyan-500/30 bg-[#04122A]/95 px-4 py-3 text-cyan-50 shadow-2xl">
              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">Reply sent</p>
              <p className="mt-1 text-sm font-semibold text-white">@{notif.replier}{notif.to ? ` replied to ${notif.to}` : ''}</p>
              <p className="mt-1 text-xs text-cyan-200">"{notif.comment}"</p>
              <p className="mt-1 text-[11px] text-cyan-400/80">{notif.product}{notif.variant ? ` / ${notif.variant}` : ''}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
