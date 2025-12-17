import express from 'express'
import Comment from '../models/Comment'
import Notification from '../models/Notification'

const router = express.Router()

// Get all comments for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { viewType } = req.query
    const query: any = { 
      productId: req.params.productId,
      status: 'approved'
    }
    
    if (viewType) query.viewType = viewType
    
    const comments = await Comment.find(query).sort({ createdAt: -1 })
    
    res.json(comments)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching comments', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Create new comment
router.post('/', async (req, res) => {
  try {
    const comment = new Comment(req.body)
    await comment.save()
    
    // Create notification for admin
    await Notification.create({
      type: 'reply',
      title: 'New comment submitted',
      message: `${req.body.userName} commented on a product`,
      meta: `${req.body.viewType} view`,
      source: 'live',
      timestamp: new Date()
    })
    
    res.status(201).json(comment)
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating comment', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Delete comment
router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id)
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    
    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting comment', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Like/Unlike comment
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body
    const comment = await Comment.findById(req.params.id)
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    
    const likedBy = comment.likedBy || []
    const hasLiked = likedBy.includes(userId)
    
    if (hasLiked) {
      // Unlike
      comment.likedBy = likedBy.filter(id => id !== userId)
      comment.likes = Math.max(0, (comment.likes || 0) - 1)
    } else {
      // Like
      comment.likedBy = [...likedBy, userId]
      comment.likes = (comment.likes || 0) + 1
    }
    
    await comment.save()
    res.json(comment)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error toggling like', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

router.get('/all', async (req, res) => {
  try {
    const { status } = req.query
    const query: any = {}
    
    if (status) query.status = status
    
    const comments = await Comment.find(query).sort({ createdAt: -1 })
    res.json(comments)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching comments', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

export default router
