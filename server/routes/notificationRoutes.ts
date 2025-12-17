import express from 'express'
import Notification from '../models/Notification'

const router = express.Router()

// Get all notifications (optionally filter by userId)
router.get('/', async (req, res) => {
  try {
    const { userId, status } = req.query
    const query: any = {}
    
    if (userId) query.userId = userId
    if (status) query.status = status
    
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .limit(100)
    
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching notifications', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Create new notification
router.post('/', async (req, res) => {
  try {
    const notification = new Notification(req.body)
    await notification.save()
    res.status(201).json(notification)
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating notification', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    )
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    
    res.json(notification)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating notification', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.body
    const query: any = { status: 'new' }
    
    if (userId) query.userId = userId
    
    await Notification.updateMany(query, { status: 'read' })
    
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating notifications', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id)
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    
    res.json({ message: 'Notification deleted successfully' })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting notification', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

export default router
