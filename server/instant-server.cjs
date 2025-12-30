const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ============================================
// MEMORY CACHE + MONGODB STORAGE
// Products load INSTANTLY from memory
// Saved to MongoDB for persistence
// ============================================

let productsCache = []; // Memory cache - instant access

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
  colorVariants: { type: Array, default: [] },
  parentId: { type: String, default: null },
  productType: { type: String, enum: ['parent', 'child', 'grandchild', null], default: null }
}, { 
  timestamps: true,
  collection: 'products'  // Explicitly set collection name
});

const Product = mongoose.model('Product', productSchema);

// User Schema for admin management
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: Boolean,
  isPermanentAdmin: Boolean,
  isVerified: Boolean,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

// AdminSettings Schema for slider and other settings
const adminSettingsSchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed,
  updatedAt: Date
});

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

// ============================================
// AUTH ROUTES
// ============================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
app.post('/api/auth/register', async (req, res) => {
  console.log('[AUTH] Register request received:', req.body.email);
  try {
    const { name, email, password, isAdmin } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[AUTH] User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      isPermanentAdmin: false,
      createdAt: new Date()
    });
    
    console.log('[AUTH] User registered:', email);
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('[AUTH] Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, isAdminLogin } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if admin login is required
    if (isAdminLogin && !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('[AUTH] User logged in:', email, isAdminLogin ? '(admin)' : '');
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isPermanentAdmin: user.isPermanentAdmin,
      token
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for password reset
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

    // Configure email transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'zainmalik55786@gmail.com',
        pass: 'lkjkuavqyhzghfgq' // App password
      }
    });

    // Send email
    await transporter.sendMail({
      from: 'zainmalik55786@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
      `
    });

    console.log('[OTP] Sent to:', email);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('[OTP] Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// ============================================
// ROUTES - ALL RETURN FROM MEMORY (INSTANT)
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', products: productsCache.length });
});

// GET all products - FROM MEMORY (instant)
app.get('/api/products', (req, res) => {
  console.log(`[GET] ${productsCache.length} products (from memory - instant)`);
  res.json(productsCache);
});

// GET single product - FROM MEMORY
app.get('/api/products/:id', (req, res) => {
  const product = productsCache.find(p => 
    p._id.toString() === req.params.id || p._id === req.params.id
  );
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

// POST - Admin adds product (saves to memory + MongoDB)
app.post('/api/products', async (req, res) => {
  try {
    console.log('[POST] Admin adding product...');
    console.log('[POST] Request body:', JSON.stringify(req.body, null, 2));
    const { id, _id, ...data } = req.body;
    
    // Validate required fields
    if (!data.name || !data.price || !data.description || !data.imageUrl) {
      const missing = [];
      if (!data.name) missing.push('name');
      if (!data.price) missing.push('price');
      if (!data.description) missing.push('description');
      if (!data.imageUrl) missing.push('imageUrl');
      console.error('[POST] Missing required fields:', missing.join(', '));
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: `Missing required fields: ${missing.join(', ')}`,
        missing 
      });
    }
    
    // Save to MongoDB
    const product = await Product.create(data);
    const productObj = product.toObject();
    
    // Add to memory cache immediately with string _id
    const cacheObj = {
      ...productObj,
      _id: productObj._id.toString()
    };
    productsCache.push(cacheObj);
    
    console.log('[POST] ✓ Added to DB:', product.name, '| ID:', productObj._id);
    console.log('[POST] └─ parentId:', productObj.parentId || 'none', '| type:', productObj.productType || 'none');
    console.log('[POST] └─ Total products in cache:', productsCache.length);
    
    res.status(201).json(cacheObj);
  } catch (error) {
    console.error('[POST] ✗ Error:', error.message);
    console.error('[POST] ✗ Stack:', error.stack);
    const details = error.errors ? Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`).join(', ') : error.message;
    res.status(400).json({ error: error.message, details });
  }
});

// PUT - Admin updates product
app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('[PUT] Updating:', req.params.id);
    const { id, _id, ...data } = req.body;
    
    // Update in MongoDB
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    // Update in memory cache with string _id
    const productObj = {
      ...product.toObject(),
      _id: product._id.toString()
    };
    const index = productsCache.findIndex(p => p._id.toString() === req.params.id);
    if (index !== -1) {
      productsCache[index] = productObj;
      console.log('[PUT] ✓ Updated in cache:', product.name);
    }
    
    res.json(productObj);
  } catch (error) {
    console.error('[PUT] ✗ Error:', error.message);
    res.status(400).json({ error: 'Failed to update' });
  }
});

// DELETE - Admin removes product
app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('[DELETE] Removing:', req.params.id);
    
    // Delete from MongoDB
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    // Remove from memory cache
    const beforeCount = productsCache.length;
    productsCache = productsCache.filter(p => p._id.toString() !== req.params.id);
    console.log('[DELETE] ✓ Removed from DB:', product.name);
    console.log('[DELETE] └─ Cache:', beforeCount, '→', productsCache.length, 'products');
    
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('[DELETE] ✗ Error:', error.message);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// ========== SLIDER ROUTES ==========

// GET - Fetch slides
app.get('/api/slides', async (req, res) => {
  try {
    const settings = await AdminSettings.findOne({ key: 'heroSlides' });
    if (!settings || !settings.value) {
      // Return default slides
      return res.json([{
        id: '1',
        title: 'Welcome to the Future',
        description: 'Experience next-generation products',
        imageUrl: '/products/s1.png',
        buttonText: 'Explore',
        linkTo: '/products',
        order: 0
      }]);
    }
    res.json(settings.value);
  } catch (error) {
    console.error('[GET] Error fetching slides:', error);
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
});

// POST - Save slides
app.post('/api/slides', async (req, res) => {
  try {
    const slides = req.body;
    await AdminSettings.findOneAndUpdate(
      { key: 'heroSlides' },
      { key: 'heroSlides', value: slides, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    console.log('[POST] Slides saved to database');
    res.json({ success: true, slides });
  } catch (error) {
    console.error('[POST] Error saving slides:', error);
    res.status(500).json({ error: 'Failed to save slides' });
  }
});

// ============================================
// START SERVER
// ============================================
async function start() {
  console.log('========================================');
  console.log('  INSTANT LOADING SERVER');
  console.log('  Products from Memory, Stored in Cloud');
  console.log('========================================');
  
  // Start HTTP server first (instant)
  const server = app.listen(PORT, () => {
    console.log(`✓ Server ready: http://localhost:${PORT}`);
  });
  server.keepAliveTimeout = 120000;
  process.stdin.resume();
  
  // Connect to MongoDB ASYNC - don't block server startup
  console.log('[DB] Connecting to MongoDB Atlas...');
  
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2
  }).then(async () => {
    console.log('[DB] ✓ Connected to MongoDB');
    
    // Load existing products to memory in background
    setTimeout(async () => {
      try {
        console.log('[DB] Loading products from MongoDB...');
        
        const db = mongoose.connection.db;
        const productsRaw = await db.collection('products').find({}).toArray();
        
        productsCache = productsRaw.map(p => ({
          _id: p._id.toString(),
          name: p.name,
          price: p.price,
          description: p.description,
          imageUrl: p.imageUrl,
          rating: p.rating || 0,
          reviewCount: p.reviewCount || 0,
          category: p.category || 'Uncategorized',
          stock: p.stock || 0,
          colors: p.colors || [],
          colorVariants: p.colorVariants || [],
          parentId: p.parentId || null,
          productType: p.productType || null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }));
        
        console.log(`[DB] ✓ Loaded ${productsCache.length} products to memory`);
        
        // Log product details for debugging
        if (productsCache.length > 0) {
          const parentProducts = productsCache.filter(p => p.productType === 'parent' || !p.parentId);
          const childProducts = productsCache.filter(p => p.productType === 'child' && p.parentId);
          console.log(`[DB] └─ ${parentProducts.length} parent products, ${childProducts.length} child products`);
          
          // Show category breakdown
          const categoryCounts = {};
          productsCache.forEach(p => {
            const cat = p.category || 'Uncategorized';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          });
          console.log(`[DB] └─ Categories:`, JSON.stringify(categoryCounts));
        } else {
          console.log('[DB] ⚠ No products found in database - starting with empty catalog');
        }
      } catch (loadError) {
        console.error('[DB] ✗ Error loading products:', loadError.message);
        console.log('[DB] Products will be loaded as they are added');
      }
    }, 2000); // Load products 2 seconds after connection
    
    // Set zainmalik55786@gmail.com as permanent admin
    try {
      const adminUser = await User.findOne({ email: 'zainmalik55786@gmail.com' });
      if (adminUser) {
        if (!adminUser.isPermanentAdmin) {
          adminUser.isPermanentAdmin = true;
          adminUser.isAdmin = true;
          await adminUser.save();
          console.log('[ADMIN] ✓ Set zainmalik55786@gmail.com as permanent admin');
        } else {
          console.log('[ADMIN] ✓ zainmalik55786@gmail.com is already permanent admin');
        }
      } else {
        console.log('[ADMIN] ⚠ User zainmalik55786@gmail.com not found in database');
      }
    } catch (error) {
      console.error('[ADMIN] Error setting permanent admin:', error.message);
    }
    
    // Keep connection alive - ping every 3 minutes
    setInterval(async () => {
      try {
        await mongoose.connection.db.admin().ping();
        console.log('[DB] Ping OK - connection alive');
      } catch (e) {
        console.log('[DB] Ping failed, reconnecting...');
        mongoose.connect(process.env.MONGODB_URI).catch(() => {});
      }
    }, 180000); // 3 minutes
    
  }).catch((error) => {
    console.error('[DB] Connection failed:', error.message);
    console.log('[DB] Server running without database - will retry connection in 10 seconds...');
    setTimeout(() => {
      start(); // Retry
    }, 10000);
  });
}

start();
