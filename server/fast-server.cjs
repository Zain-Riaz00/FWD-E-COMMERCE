const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ============================================
// IN-MEMORY PRODUCT STORE - INSTANT RESPONSE
// ============================================
let productsStore = [];
let isLoaded = false;
let isLoading = false;

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  category: { type: String, default: 'Uncategorized' },
  stock: { type: Number, default: 0 },
  colors: [String],
  colorVariants: { type: Array, default: [] }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Load products from DB to memory (runs in background)
async function loadProductsToMemory() {
  if (isLoading) return;
  isLoading = true;
  
  try {
    console.log('[CACHE] Loading products from MongoDB...');
    const start = Date.now();
    const products = await Product.find({}).lean();
    productsStore = products;
    isLoaded = true;
    console.log(`[CACHE] Loaded ${products.length} products in ${Date.now() - start}ms`);
  } catch (error) {
    console.error('[CACHE] Error loading products:', error.message);
  } finally {
    isLoading = false;
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    cached: isLoaded,
    products: productsStore.length,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

// GET all products - INSTANT from memory
app.get('/api/products', (req, res) => {
  console.log(`[GET] /api/products - Returning ${productsStore.length} products from memory (instant)`);
  res.json(productsStore);
  
  // Refresh cache in background if not loading
  if (!isLoading && mongoose.connection.readyState === 1) {
    loadProductsToMemory();
  }
});

// GET single product - from memory
app.get('/api/products/:id', (req, res) => {
  const product = productsStore.find(p => p._id.toString() === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

// POST create product - save to DB AND memory
app.post('/api/products', async (req, res) => {
  try {
    console.log('[POST] Creating product');
    const { id, _id, ...data } = req.body;
    const product = await Product.create(data);
    
    // Add to memory store immediately
    const productObj = product.toObject();
    productsStore.push(productObj);
    
    console.log('[POST] Created and cached:', product._id);
    res.status(201).json(productObj);
  } catch (error) {
    console.error('[POST] Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PUT update product - update DB AND memory
app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('[PUT] Updating:', req.params.id);
    const { id, _id, ...data } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    // Update in memory store
    const productObj = product.toObject();
    const index = productsStore.findIndex(p => p._id.toString() === req.params.id);
    if (index !== -1) {
      productsStore[index] = productObj;
    }
    
    res.json(productObj);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update' });
  }
});

// DELETE product - delete from DB AND memory
app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('[DELETE]:', req.params.id);
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    // Remove from memory store
    productsStore = productsStore.filter(p => p._id.toString() !== req.params.id);
    
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Main function
async function main() {
  console.log('='.repeat(50));
  console.log('FAST E-COMMERCE SERVER');
  console.log('='.repeat(50));
  
  // Start server FIRST - don't wait for DB
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log('✓ API will return cached data instantly');
  });
  
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 120000;
  process.stdin.resume();
  
  // Connect to MongoDB in background
  console.log('[DB] Connecting to MongoDB Atlas...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 60000, // Wait up to 60s for connection
    });
    console.log('[DB] ✓ MongoDB Connected');
    
    // Load products to memory
    await loadProductsToMemory();
    
    // Keep connection warm - ping every 4 minutes
    setInterval(() => {
      if (mongoose.connection.readyState === 1) {
        mongoose.connection.db.admin().ping()
          .then(() => console.log('[DB] Ping OK'))
          .catch(() => console.log('[DB] Ping failed'));
      }
    }, 240000);
    
  } catch (error) {
    console.error('[DB] Connection failed:', error.message);
    console.log('[DB] Server will continue with empty cache');
    console.log('[DB] Retrying connection in 10 seconds...');
    setTimeout(() => {
      mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log('[DB] Reconnected!');
        loadProductsToMemory();
      }).catch(() => {});
    }, 10000);
  }
}

main();
