import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL || 'https://your-app.vercel.app'
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '50mb' })) // Increased limit for large images
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Simple MongoDB Connection - works fast with Atlas free tier
const connectDB = async () => {
  try {
    // Simple connection - let mongoose handle the defaults
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('✓ MongoDB Connected!')
    
    // Keep connection alive with periodic ping
    setInterval(async () => {
      try {
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.db?.admin().ping()
        }
      } catch (e) {
        console.log('Connection check failed, mongoose will auto-reconnect')
      }
    }, 30000) // Ping every 30 seconds
    
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error)
    // Don't exit, just log the error and retry
    console.log('Retrying in 3 seconds...')
    setTimeout(connectDB, 3000)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
})

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Import routes (we'll create these next)
import productRoutes from './routes/productRoutes'
import authRoutes from './routes/authRoutes'
import notificationRoutes from './routes/notificationRoutes'
import reviewRoutes from './routes/reviewRoutes'
import commentRoutes from './routes/commentRoutes'
import adminRoutes from './routes/adminRoutes'
import categoryRoutes from './routes/categoryRoutes'

app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/admin', adminRoutes)

// Start server
const startServer = async () => {
  await connectDB()
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
  
  // Keep server alive
  server.keepAliveTimeout = 0
  server.headersTimeout = 0
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...')
    server.close(() => {
      mongoose.connection.close()
      process.exit(0)
    })
  })
}

startServer().catch(console.error)

export default app
