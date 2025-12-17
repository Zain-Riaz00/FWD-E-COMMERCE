import express from 'express'
import AdminSettings from '../models/AdminSettings'
import User from '../models/User'
import bcrypt from 'bcryptjs'

const router = express.Router()

// Get admin settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await AdminSettings.findOne()
    
    // Create default settings if none exist
    if (!settings) {
      settings = new AdminSettings({})
      await settings.save()
    }
    
    res.json(settings)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching admin settings', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Update help page content
router.patch('/settings/help-page', async (req, res) => {
  try {
    let settings = await AdminSettings.findOne()
    
    if (!settings) {
      settings = new AdminSettings({})
    }
    
    settings.helpPageContent = {
      ...settings.helpPageContent,
      ...req.body
    }
    
    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating help page', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Update terms page content
router.patch('/settings/terms-page', async (req, res) => {
  try {
    let settings = await AdminSettings.findOne()
    
    if (!settings) {
      settings = new AdminSettings({})
    }
    
    settings.termsPageContent = {
      ...settings.termsPageContent,
      ...req.body
    }
    
    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating terms page', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Update about page content
router.patch('/settings/about-page', async (req, res) => {
  try {
    let settings = await AdminSettings.findOne()
    
    if (!settings) {
      settings = new AdminSettings({})
    }
    
    settings.aboutPageContent = {
      ...settings.aboutPageContent,
      ...req.body
    }
    
    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating about page', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Update contact page content
router.patch('/settings/contact-page', async (req, res) => {
  try {
    let settings = await AdminSettings.findOne()
    
    if (!settings) {
      settings = new AdminSettings({})
    }
    
    settings.contactPageContent = {
      ...settings.contactPageContent,
      ...req.body
    }
    
    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating contact page', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Add admin user
router.post('/add-admin', async (req, res) => {
  try {
    const { email, password, name, addedBy } = req.body
    
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() })
    
    if (user) {
      // Update existing user to admin
      user.isAdmin = true
      user.isVerified = true
      await user.save()
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10)
      user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        isAdmin: true,
        isVerified: true
      })
      await user.save()
    }
    
    // Add to admin settings
    let settings = await AdminSettings.findOne()
    
    if (!settings) {
      settings = new AdminSettings({})
    }
    
    // Check if admin already in list
    const existingAdmin = settings.adminUsers.find(
      admin => admin.email === email.toLowerCase()
    )
    
    if (!existingAdmin) {
      settings.adminUsers.push({
        email: email.toLowerCase(),
        name,
        isActive: true,
        addedAt: new Date(),
        addedBy
      })
      await settings.save()
    }
    
    res.json({ 
      message: 'Admin user added successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified
      }
    })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error adding admin user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Remove admin access
router.delete('/remove-admin/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase()
    
    // Update user
    const user = await User.findOne({ email })
    if (user) {
      user.isAdmin = false
      await user.save()
    }
    
    // Remove from admin settings
    const settings = await AdminSettings.findOne()
    if (settings) {
      settings.adminUsers = settings.adminUsers.filter(
        admin => admin.email !== email
      )
      await settings.save()
    }
    
    res.json({ message: 'Admin access removed successfully' })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error removing admin', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Toggle admin status
router.patch('/toggle-admin/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase()
    const { isActive } = req.body
    
    const settings = await AdminSettings.findOne()
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' })
    }
    
    const admin = settings.adminUsers.find(a => a.email === email)
    if (admin) {
      admin.isActive = isActive
      await settings.save()
    }
    
    // Also update user if disabling
    if (!isActive) {
      const user = await User.findOne({ email })
      if (user) {
        user.isAdmin = false
        await user.save()
      }
    }
    
    res.json(settings)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error toggling admin status', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Get all admin users
router.get('/admins', async (req, res) => {
  try {
    const settings = await AdminSettings.findOne()
    
    if (!settings) {
      return res.json({ adminUsers: [] })
    }
    
    res.json({ adminUsers: settings.adminUsers })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching admin users', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Update admin profile (add verified badge)
router.patch('/profile/:userId', async (req, res) => {
  try {
    const { isVerified, ...otherFields } = req.body
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isVerified, ...otherFields },
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Get all admin users
router.get('/users', async (req, res) => {
  try {
    const admins = await User.find({ isAdmin: true }).select('-__v')
    res.json(admins)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching admins', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Find and delete user by email (for cleanup)
router.delete('/users/email/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase()
    const user = await User.findOne({ email })
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await User.findByIdAndDelete(user._id)
    res.json({ message: 'User deleted successfully', email })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Update admin user
router.patch('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' })
    }

    // Update fields if provided
    if (req.body.email) user.email = req.body.email
    if (req.body.password) user.password = req.body.password
    if (req.body.name) user.name = req.body.name
    
    await user.save()
    res.json({ message: 'Admin updated successfully', user })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating admin', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Delete admin user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' })
    }

    // Prevent deletion of permanent admin
    if (user.isPermanentAdmin) {
      return res.status(403).json({ message: 'Cannot delete permanent admin. Transfer permanent admin role first.' })
    }
    
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Admin deleted successfully' })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting admin', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Set initial permanent admin (one-time setup)
router.patch('/users/:id/set-permanent', async (req, res) => {
  try {
    // Check if there's already a permanent admin
    const existingPermanent = await User.findOne({ isPermanentAdmin: true })
    if (existingPermanent) {
      return res.status(400).json({ 
        message: 'A permanent admin already exists',
        permanentAdmin: {
          _id: existingPermanent._id,
          name: existingPermanent.name,
          email: existingPermanent.email
        }
      })
    }
    
    // Set the user as permanent admin
    const user = await User.findById(req.params.id)
    if (!user || !user.isAdmin) {
      return res.status(404).json({ message: 'Admin not found' })
    }
    
    user.isPermanentAdmin = true
    await user.save()
    
    res.json({ 
      message: 'Permanent admin set successfully',
      permanentAdmin: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error setting permanent admin', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Transfer permanent admin role
router.post('/users/:id/transfer-permanent', async (req, res) => {
  try {
    const { currentPermanentAdminId } = req.body
    
    // Verify current permanent admin
    const currentPermanent = await User.findById(currentPermanentAdminId)
    if (!currentPermanent || !currentPermanent.isPermanentAdmin) {
      return res.status(403).json({ message: 'Invalid permanent admin credentials' })
    }
    
    // Get new admin
    const newPermanent = await User.findById(req.params.id)
    if (!newPermanent || !newPermanent.isAdmin) {
      return res.status(404).json({ message: 'Admin not found' })
    }
    
    // Transfer role
    currentPermanent.isPermanentAdmin = false
    newPermanent.isPermanentAdmin = true
    
    await currentPermanent.save()
    await newPermanent.save()
    
    res.json({ 
      message: 'Permanent admin role transferred successfully',
      newPermanentAdmin: {
        _id: newPermanent._id,
        name: newPermanent.name,
        email: newPermanent.email
      }
    })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error transferring permanent admin role', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Clean up emails with timestamps (fix corrupted emails)
router.post('/users/cleanup', async (req, res) => {
  try {
    // Find all users with '+' in their email (timestamp pattern)
    const users = await User.find({ email: { $regex: /\+\d+@/ } })
    
    const cleanedUsers = []
    for (const user of users) {
      // Extract the original email before the timestamp
      const originalEmail = user.email.replace(/\+\d+@/, '@')
      
      // Check if a user with the clean email already exists
      const existingUser = await User.findOne({ email: originalEmail, _id: { $ne: user._id } })
      
      if (!existingUser) {
        // Update to clean email if no conflict
        user.email = originalEmail
        await user.save()
        cleanedUsers.push({ oldEmail: user.email, newEmail: originalEmail })
      } else {
        // Delete the duplicate if original exists
        await User.findByIdAndDelete(user._id)
        cleanedUsers.push({ deleted: user.email, reason: 'Duplicate of ' + originalEmail })
      }
    }
    
    res.json({ 
      message: 'Cleanup completed', 
      cleaned: cleanedUsers.length,
      details: cleanedUsers 
    })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error during cleanup', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

export default router
