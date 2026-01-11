const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  reviews: { type: Array, default: [] },
  category: { type: String, default: 'Uncategorized' },
  stock: { type: Number, default: 0 },
  colors: [String],
  colorVariants: { type: Array, default: [] },
  parentId: { type: String, default: null },
  productType: { type: String, enum: ['parent', 'child', 'grandchild', null], default: null }
}, { 
  timestamps: true,
  collection: 'products'
});

const Product = mongoose.model('Product', productSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: String,
  userId: String,
  userName: { type: String, required: true },
  userEmail: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  viewType: { type: String, enum: ['gallery', 'immersive', null], default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  replied: { type: Boolean, default: false },
  replyText: String,
  repliedAt: Date
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: String,
  userId: String,
  userName: { type: String, required: true },
  userEmail: String,
  comment: { type: String, required: true },
  viewType: { type: String, enum: ['gallery', 'immersive', null], default: null },
  parentCommentId: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

// Category Schema
const categorySchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#06b6d4' },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ============================================
// PASSWORD RESET ROUTES
// ============================================

// Send OTP for password reset
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('[OTP] Request for:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('[OTP] User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
    console.log('[OTP] Generated OTP for', email, ':', otp);

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'zainmalik55786@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'lkjkuavqyhzghfgq' // App password
      }
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'zainmalik55786@gmail.com',
      to: email,
      subject: 'Password Reset OTP - E-Commerce Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #06b6d4;">Password Reset OTP</h2>
          <p>You have requested to reset your password.</p>
          <p>Your OTP code is:</p>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This OTP will expire in 5 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    console.log('[OTP] Email sent successfully to:', email);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('[OTP] Error:', error);
    res.status(500).json({ message: 'Failed to send OTP: ' + error.message });
  }
});

// Verify OTP and reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log('[RESET] Attempt for:', email);

    // Verify OTP
    const storedOTP = otpStore.get(email);
    if (!storedOTP) {
      console.log('[RESET] No OTP found for:', email);
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (Date.now() > storedOTP.expires) {
      otpStore.delete(email);
      console.log('[RESET] OTP expired for:', email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedOTP.otp !== otp) {
      console.log('[RESET] Invalid OTP for:', email);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword; // In production, hash this!
    await user.save();

    // Clear OTP
    otpStore.delete(email);
    console.log('[RESET] Password updated successfully for:', email);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('[RESET] Error:', error);
    res.status(500).json({ message: 'Failed to reset password: ' + error.message });
  }
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    console.log('[REGISTER] New user:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // In production, hash this with bcrypt!
      isAdmin: isAdmin || false,
      role: isAdmin ? 'admin' : 'user'
    });

    await user.save();
    console.log('[REGISTER] User created:', email);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;
    console.log('[LOGIN] Attempt for:', email, 'Admin:', isAdmin);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password (In production, use bcrypt.compare!)
    if (user.password !== password) {
      console.log('[LOGIN] Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check admin access
    if (isAdmin && !user.isAdmin) {
      console.log('[LOGIN] Non-admin trying admin login:', email);
      return res.status(403).json({ message: 'Admin access denied' });
    }

    console.log('[LOGIN] Success:', email);
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    res.status(500).json({ message: 'Login failed: ' + error.message });
  }
});

// ============================================
// PRODUCT ROUTES
// ============================================

// Simple count endpoint
app.get('/api/products/count', async (req, res) => {
  try {
    const total = await Product.countDocuments({});
    const children = await Product.countDocuments({ productType: 'child' });
    const adminAdded = await Product.countDocuments({ 
      id: { $regex: /^admin-product-/ } 
    });
    
    const recent = await Product.find({}).sort({ createdAt: -1 }).limit(5).select('name id productType createdAt').lean();
    
    res.json({ 
      total, 
      children, 
      adminAdded,
      recent: recent.map(p => ({
        name: p.name,
        id: p.id || p._id.toString(),
        type: p.productType,
        created: p.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    console.log('[GET] /api/products - Starting fetch...');
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('[GET] MongoDB not connected! State:', mongoose.connection.readyState);
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const products = await Product.find({}).lean();
    console.log(`[GET] Found ${products.length} products in DB`);
    
    // Log each product name and ID
    products.forEach(p => {
      console.log(`[GET]   - ${p.name} (id: ${p.id || 'none'}, _id: ${p._id})`);
    });
    
    // Populate reviews for each product
    const productsWithReviews = [];
    for (const product of products) {
      // Ensure id field is set - use existing id or generate from _id
      const productId = product.id || product._id.toString();
      
      const reviews = await Review.find({ 
        productId: productId,
        status: 'approved'
      }).lean();
      
      console.log(`[GET] Product "${product.name}" (${productId}): ${reviews.length} reviews`);
      
      productsWithReviews.push({
        ...product,
        _id: product._id.toString(),
        id: productId, // ALWAYS include id field
        reviews: reviews || []
      });
    }
    
    console.log(`[GET] Returning ${productsWithReviews.length} products with reviews`);
    res.json(productsWithReviews);
  } catch (error) {
    console.error('[GET] Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = await Product.findOne({ id }).lean();
    if (!product) {
      product = await Product.findById(id).lean();
    }
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    // Populate reviews
    const productId = product.id || product._id.toString();
    const reviews = await Review.find({ 
      productId: productId,
      status: 'approved'
    }).lean();
    
    const result = {
      ...product,
      _id: product._id.toString(),
      id: productId,
      reviews: reviews || []
    };
    
    res.json(result);
  } catch (error) {
    console.error('[GET] Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    console.log('[POST] Creating product:', req.body.name);
    const { _id, ...data } = req.body;
    
    // Allow products without category
    if (!data.category) {
      data.category = 'Uncategorized';
    }
    
    // Ensure productType is set (default to 'parent' for admin-added products)
    if (!data.productType) {
      data.productType = 'parent';
    }
    
    // Generate unique ID if not provided
    if (!data.id) {
      data.id = `product-${Date.now()}`;
    }
    
    console.log('[POST] Product data before save:', { id: data.id, name: data.name, productType: data.productType });
    
    const product = await Product.create(data);
    console.log('[POST] Created product in DB - _id:', product._id, 'id:', product.id);
    
    // Return with id field populated
    const productObj = product.toObject();
    productObj.id = productObj.id || productObj._id.toString();
    
    console.log('[POST] Returning product:', { _id: productObj._id, id: productObj.id, name: productObj.name });
    res.status(201).json(productObj);
  } catch (error) {
    console.error('[POST] Create error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('[PUT] Updating:', req.params.id);
    const { _id, ...data } = req.body;
    
    let product = await Product.findOne({ id: req.params.id });
    if (!product) {
      product = await Product.findById(req.params.id);
    }
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    Object.assign(product, data);
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('[PUT] Error:', error);
    res.status(400).json({ error: 'Failed to update' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('[DELETE]:', req.params.id);
    let product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) {
      product = await Product.findByIdAndDelete(req.params.id);
    }
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// ========== REVIEW ROUTES ==========

// GET - Fetch reviews for a specific product (filtered by viewType)
app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { viewType } = req.query;
    
    let query = { productId, status: 'approved' };
    if (viewType) {
      query.viewType = viewType;
    }
    
    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
    
    // Ensure each review has an id field for React keys
    const reviewsWithId = reviews.map(r => ({
      ...r,
      _id: r._id.toString(),
      id: r.id || r._id.toString()
    }));
    
    console.log(`[GET] Found ${reviewsWithId.length} reviews for product ${productId} (viewType: ${viewType})`);
    res.json(reviewsWithId);
  } catch (error) {
    console.error('[GET] Error fetching product reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET - Fetch user's rating for a specific product and viewType
app.get('/api/reviews/user-rating/:productId/:userId/:viewType', async (req, res) => {
  try {
    const { productId, userId, viewType } = req.params;
    
    const review = await Review.findOne({
      productId,
      userId: decodeURIComponent(userId),
      viewType
    });
    
    if (review) {
      console.log(`[GET] Found user rating: ${review.rating} for ${productId}`);
      res.json({ rating: review.rating, reviewId: review._id });
    } else {
      res.json({ rating: 0 });
    }
  } catch (error) {
    console.error('[GET] Error fetching user rating:', error);
    res.status(500).json({ error: 'Failed to fetch user rating' });
  }
});

// POST - Submit review
app.post('/api/reviews', async (req, res) => {
  try {
    const review = await Review.create(req.body);
    console.log('[POST] Review submitted for product:', review.productId);
    
    // Return with id field populated
    const reviewObj = review.toObject();
    reviewObj.id = reviewObj.id || reviewObj._id.toString();
    reviewObj._id = reviewObj._id.toString();
    
    res.status(201).json(reviewObj);
  } catch (error) {
    console.error('[POST] Error submitting review:', error);
    res.status(400).json({ error: 'Failed to submit review' });
  }
});

// ========== COMMENT ROUTES ==========

// GET - Fetch comments for a specific product (filtered by viewType)
app.get('/api/comments/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { viewType } = req.query;
    
    let query = { productId, status: 'approved' };
    if (viewType) {
      query.viewType = viewType;
    }
    
    const comments = await Comment.find(query).sort({ createdAt: -1 }).lean();
    
    // Ensure each comment has an id field for React keys
    const commentsWithId = comments.map(c => ({
      ...c,
      _id: c._id.toString(),
      id: c.id || c._id.toString()
    }));
    
    console.log(`[GET] Found ${commentsWithId.length} comments for product ${productId} (viewType: ${viewType})`);
    res.json(commentsWithId);
  } catch (error) {
    console.error('[GET] Error fetching product comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST - Submit comment
app.post('/api/comments', async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    console.log('[POST] Comment submitted for product:', comment.productId);
    
    // Return with id field populated
    const commentObj = comment.toObject();
    commentObj.id = commentObj.id || commentObj._id.toString();
    commentObj._id = commentObj._id.toString();
    
    res.status(201).json(commentObj);
  } catch (error) {
    console.error('[POST] Error submitting comment:', error);
    res.status(400).json({ error: 'Failed to submit comment' });
  }
});

// ========== CATEGORY ROUTES ==========

// GET - Fetch all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    console.log(`[GET] Found ${categories.length} categories`);
    res.json(categories);
  } catch (error) {
    console.error('[GET] Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST - Create category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, color, imageUrl, id } = req.body;
    const category = new Category({ id, name, description, color, imageUrl });
    await category.save();
    console.log('[POST] Category created:', name);
    res.status(201).json(category);
  } catch (error) {
    console.error('[POST] Error creating category:', error);
    res.status(400).json({ error: 'Failed to create category' });
  }
});

// PUT - Update category
app.put('/api/categories/:id', async (req, res) => {
  try {
    let category = await Category.findOne({ id: req.params.id });
    if (!category) {
      category = await Category.findById(req.params.id);
    }
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    Object.assign(category, req.body);
    await category.save();
    
    console.log('[PUT] Category updated:', category.name);
    res.json(category);
  } catch (error) {
    console.error('[PUT] Error updating category:', error);
    res.status(400).json({ error: 'Failed to update category' });
  }
});

// DELETE - Delete category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    let category = await Category.findOneAndDelete({ id: req.params.id });
    if (!category) {
      category = await Category.findByIdAndDelete(req.params.id);
    }
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    console.log('[DELETE] Category deleted:', category.name);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('[DELETE] Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Load local products into MongoDB
async function loadLocalProducts() {
  try {
    const localProducts = [
      { id: 'local-cooling-fan', name: 'Cooling Fan', price: 49.99, description: 'High-performance RGB cooling fan with ultra-quiet operation and adjustable speeds for optimal airflow', imageUrl: '/products/c.png', category: 'electronics', stock: 50, productType: 'child', parentId: 'local-parent-electronics' },
      { id: 'local-gaming-chair', name: 'Gaming Chair', price: 299.99, description: 'Ergonomic gaming chair with lumbar support, adjustable armrests, and premium leather upholstery', imageUrl: '/products/ch.png', category: 'electronics', stock: 30, productType: 'child', parentId: 'local-parent-electronics' },
      { id: 'local-headphones', name: 'Headphones', price: 129.99, description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life', imageUrl: '/products/h.png', category: 'electronics', stock: 75, productType: 'child', parentId: 'local-parent-electronics' },
      { id: 'local-keyboard', name: 'Keyboard', price: 89.99, description: 'Mechanical gaming keyboard with RGB backlighting and programmable keys', imageUrl: '/products/k.png', category: 'electronics', stock: 60, productType: 'child', parentId: 'local-parent-electronics' },
      { id: 'local-mouse', name: 'Mouse', price: 59.99, description: 'Precision gaming mouse with adjustable DPI and customizable RGB lighting', imageUrl: '/products/m.png', category: 'electronics', stock: 100, productType: 'child', parentId: 'local-parent-electronics' },
      { id: 'local-mousepad', name: 'Mousepad', price: 24.99, description: 'Extended gaming mousepad with smooth surface and non-slip rubber base', imageUrl: '/products/mp.png', category: 'electronics', stock: 150, productType: 'child', parentId: 'local-parent-electronics' },
      { id: 'local-monitor', name: 'Monitor', price: 399.99, description: '27-inch 4K gaming monitor with 144Hz refresh rate and HDR support', imageUrl: '/products/mon.png', category: 'electronics', stock: 40, productType: 'child', parentId: 'local-parent-electronics' },
      { id: 'local-powerbank', name: 'Powerbank', price: 39.99, description: 'High-capacity portable charger with fast charging and multiple USB ports', imageUrl: '/products/pb.png', category: 'electronics', stock: 120, productType: 'child', parentId: 'local-parent-electronics' },
      { id: 'local-slipper', name: 'Slipper', price: 34.99, description: 'Comfortable memory foam slippers with anti-slip sole', imageUrl: '/products/s.png', category: 'electronics', stock: 80, productType: 'child', parentId: 'local-parent-electronics' },
      { id: 'local-webcam', name: 'Webcam', price: 79.99, description: '1080p HD webcam with built-in microphone and auto-focus', imageUrl: '/products/w.png', category: 'electronics', stock: 65, productType: 'child', parentId: 'local-parent-electronics' },
      { id: 'local-smartwatch', name: 'Smartwatch', price: 199.99, description: 'Feature-rich smartwatch with fitness tracking and heart rate monitor', imageUrl: '/products/sw.png', category: 'electronics', stock: 45, productType: 'child', parentId: 'local-parent-electronics' }
    ];
    
    let loadedCount = 0;
    let skippedCount = 0;
    
    for (const productData of localProducts) {
      const existing = await Product.findOne({ id: productData.id });
      if (!existing) {
        await Product.create(productData);
        loadedCount++;
      } else {
        skippedCount++;
      }
    }
    
    if (loadedCount > 0) {
      console.log(`✓ Loaded ${loadedCount} local products into database`);
    }
    if (skippedCount > 0) {
      console.log(`✓ ${skippedCount} local products already in database`);
    }
  } catch (error) {
    console.error('Error loading local products:', error.message);
  }
}

// Main function
async function main() {
  try {
    console.log('Connecting to MongoDB...');
    
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected event');
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected event - attempting to reconnect...');
    });
    
    mongoose.connection.on('error', (err) => {
      console.log('Mongoose error event:', err.message);
    });
    
    // MongoDB connection with better options
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log('✓ MongoDB Connected');
    
    // Load local products into database if they don't exist
    await loadLocalProducts();
    
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
