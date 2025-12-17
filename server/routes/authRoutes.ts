import { Router, Request, Response } from 'express'
import User from '../models/User'
import AdminSettings from '../models/AdminSettings'

const router = Router()

// Register user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, isAdmin } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    // Create new user (password should be hashed in production!)
    const user = await User.create({ 
      name, 
      email: email.toLowerCase(), 
      password,
      isAdmin: isAdmin || false,
      isVerified: isAdmin || false // Auto-verify admins
    })

    // If registering as admin, add to AdminSettings
    if (isAdmin) {
      let adminSettings = await AdminSettings.findOne()
      if (!adminSettings) {
        adminSettings = new AdminSettings({})
      }

      // Check if admin email already exists in settings
      const adminExists = adminSettings.adminUsers.some(
        admin => admin.email.toLowerCase() === email.toLowerCase()
      )

      if (!adminExists) {
        adminSettings.adminUsers.push({
          email: email.toLowerCase(),
          name: name,
          isActive: true,
          addedAt: new Date(),
          addedBy: 'system'
        })
        await adminSettings.save()
      }
    }
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      message: 'Account created successfully!'
    })
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, isAdminLogin } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check password (should use bcrypt in production!)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // If this is an admin login, verify admin status
    if (isAdminLogin) {
      // Check if user is an admin
      if (!user.isAdmin) {
        return res.status(403).json({ message: 'You do not have admin privileges. Please contact an administrator.' })
      }

      // Check if the admin email exists in AdminSettings
      const adminSettings = await AdminSettings.findOne()
      if (adminSettings) {
        const adminUser = adminSettings.adminUsers.find(
          admin => admin.email.toLowerCase() === email.toLowerCase() && admin.isActive
        )
        
        if (!adminUser) {
          return res.status(403).json({ message: 'Admin access not authorized. Contact the system administrator.' })
        }
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isPermanentAdmin: user.isPermanentAdmin,
      isVerified: user.isVerified,
      message: 'Login successful!'
    })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Get all users (admin only)
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

export default router
