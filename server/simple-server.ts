import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Create HTTP server (important for keeping alive)
const server = http.createServer(app)

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Product Schema (inline for simplicity)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  category: { type: String, default: 'Uncategorized' },
  stock: { type: Number, default: 0 },
  colors: { type: [String], default: [] },
  colorVariants: { type: Array, default: [] }
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    console.log('[GET] /api/products')
    const products = await Product.find({}).lean()
    console.log(`Found ${products.length} products`)
    res.json(products)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST create product
app.post('/api/products', async (req, res) => {
  try {
    console.log('[POST] Creating product')
    const { id, _id, ...data } = req.body
    const product = await Product.create(data)
    console.log('Created:', product._id)
    res.status(201).json(product)
  } catch (error: any) {
    console.error('Create error:', error.message)
    res.status(400).json({ error: error.message })
  }
})

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('[PUT] Updating:', req.params.id)
    const { id, _id, ...data } = req.body
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true })
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json(product)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update' })
  }
})

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('[DELETE]:', req.params.id)
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' })
  }
})

// Connect and start
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('✓ MongoDB Connected')
    
    server.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`)
    })
    
    // Keep alive - important!
    server.keepAliveTimeout = 65000
    server.headersTimeout = 66000
    
  } catch (error) {
    console.error('Failed to start:', error)
    process.exit(1)
  }
}

main()
