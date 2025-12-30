const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ============================================
// LOCAL FILE STORAGE - INSTANT, NO DATABASE
// ============================================
const DATA_FILE = path.join(__dirname, 'products.json');

// Load products from file
function loadProducts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading products:', error.message);
  }
  return [];
}

// Save products to file
function saveProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving products:', error.message);
    return false;
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// In-memory store (loaded from file on startup)
let products = loadProducts();
console.log(`Loaded ${products.length} products from file`);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', products: products.length });
});

// GET all products - INSTANT
app.get('/api/products', (req, res) => {
  console.log(`[GET] Returning ${products.length} products`);
  res.json(products);
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p._id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

// POST create product
app.post('/api/products', (req, res) => {
  console.log('[POST] Creating product');
  const { id, _id, ...data } = req.body;
  
  const product = {
    _id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(product);
  saveProducts(products);
  
  console.log('[POST] Created:', product._id);
  res.status(201).json(product);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  console.log('[PUT] Updating:', req.params.id);
  const { id, _id, ...data } = req.body;
  
  const index = products.findIndex(p => p._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  products[index] = {
    ...products[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  saveProducts(products);
  res.json(products[index]);
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  console.log('[DELETE]:', req.params.id);
  const index = products.findIndex(p => p._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  products.splice(index, 1);
  saveProducts(products);
  
  res.json({ message: 'Deleted' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(40));
  console.log('LOCAL STORAGE SERVER - INSTANT RESPONSE');
  console.log('='.repeat(40));
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Products: ${products.length}`);
  console.log('='.repeat(40));
});

server.keepAliveTimeout = 120000;
process.stdin.resume();
