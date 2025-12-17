import express from 'express'
import Review from '../models/Review'
import Notification from '../models/Notification'

const router = express.Router()

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { viewType } = req.query
    const query: any = { 
      productId: req.params.productId,
      status: 'approved'
    }
    
    if (viewType) query.viewType = viewType
    
    const reviews = await Review.find(query).sort({ createdAt: -1 })
    
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching reviews', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Get user's existing rating for a product
router.get('/user-rating/:productId/:userId/:viewType', async (req, res) => {
  try {
    const { productId, userId, viewType } = req.params
    const review = await Review.findOne({ 
      productId,
      userId,
      viewType,
      status: 'approved'
    })
    
    if (review) {
      res.json({ rating: review.rating, reviewId: review._id })
    } else {
      res.json({ rating: 0, reviewId: null })
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user rating', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Get all reviews (admin)
router.get('/all', async (req, res) => {
  try {
    const { status } = req.query
    const query: any = {}
    
    if (status) query.status = status
    
    const reviews = await Review.find(query).sort({ createdAt: -1 })
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching reviews', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Create or update review (rating only - comments are separate)
router.post('/', async (req, res) => {
  try {
    const { productId, userId, viewType, rating, userName, userEmail } = req.body
    
    // Check if user already has a rating for this product+viewType
    const existingReview = await Review.findOne({ productId, userId, viewType })
    
    if (existingReview) {
      // Update existing rating
      existingReview.rating = rating
      await existingReview.save()
      
      res.json(existingReview)
    } else {
      // Create new review (rating only, no comment required)
      const review = new Review({
        productId,
        userId,
        userName,
        userEmail,
        rating,
        viewType,
        status: 'approved'
      })
      await review.save()
      
      // Create notification for admin
      await Notification.create({
        type: 'reply',
        title: 'New rating submitted',
        message: `${userName} rated a product`,
        meta: `Rating: ${rating}/5 (${viewType})`,
        source: 'live',
        timestamp: new Date()
      })
      
      res.status(201).json(review)
    }
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating review', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Add reply to review
router.post('/:id/reply', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    
    review.replies.push({
      ...req.body,
      timestamp: new Date()
    })
    
    await review.save()
    
    // Create notification for the reviewer
    await Notification.create({
      type: 'reply',
      title: 'Reply to your review',
      message: `${req.body.userName} replied to your review`,
      meta: req.body.isAdmin ? 'Admin response' : 'User response',
      userId: review.userId,
      source: 'live',
      timestamp: new Date()
    })
    
    res.json(review)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error adding reply', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Update review status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    
    res.json(review)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating review', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Update review likes/dislikes
router.patch('/:id/reaction', async (req, res) => {
  try {
    const { type } = req.body // 'like' or 'dislike'
    const review = await Review.findById(req.params.id)
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    
    if (type === 'like') {
      review.likes += 1
    } else if (type === 'dislike') {
      review.dislikes += 1
    }
    
    await review.save()
    res.json(review)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating reaction', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Delete review
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id)
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    
    res.json({ message: 'Review deleted successfully' })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting review', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

export default router
