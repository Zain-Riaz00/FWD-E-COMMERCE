const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/api/products', async (req, res) => {
  try {
    console.log('[GET] /api/products');
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    console.log('[POST] Creating product');
    const { id, _id, ...data } = req.body;
    const product = await Product.create(data);
    console.log('Created:', product._id);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('[PUT] Updating:', req.params.id);
    const { id, _id, ...data } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('[DELETE]:', req.params.id);
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Main function
async function main() {
  try {
    console.log('Connecting to MongoDB...');
    
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected event');
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected event');
    });
    
    mongoose.connection.on('error', (err) => {
      console.log('Mongoose error event:', err);
    });
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log('Server will keep running...');
    });
    
    // Keep the server alive
    server.keepAliveTimeout = 120000;
    server.headersTimeout = 120000;
    
    // Prevent Node.js from exiting
    process.stdin.resume();
    
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
}

main();
