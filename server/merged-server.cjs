const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ============================================
// MEMORY CACHE FOR INSTANT LOADING
// ============================================
let productsCache = [];

// ============================================
// MONGODB SCHEMAS
// ============================================

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
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
}, { timestamps: true, collection: 'products' });

const Product = mongoose.model('Product', productSchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isPermanentAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

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
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
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

// Order Schema
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: String,
  items: [{
    productId: String,
    productName: String,
    price: Number,
    quantity: Number,
    imageUrl: String
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  trackingNumber: String,
  estimatedDelivery: Date
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['order', 'product', 'reward', 'system', 'reply', 'contact', 'inventory', 'feedback', 'admin_action'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  meta: String,
  status: { type: String, enum: ['new', 'read'], default: 'new' },
  isAdminNotification: { type: Boolean, default: false },
  relatedId: String,
  relatedType: String
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

// AdminSettings Schema
const adminSettingsSchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed,
  updatedAt: Date
});

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

// ActivityLog Schema
const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  actionType: { 
    type: String, 
    enum: ['login', 'logout', 'register', 'product_add', 'product_edit', 'product_delete', 'admin_add', 'admin_remove', 'freeze', 'unfreeze', 'discount', 'order', 'other'],
    default: 'other'
  },
  details: { type: String, default: '' },
  ipAddress: String,
  userAgent: String,
  isAdminAction: { type: Boolean, default: false }
}, { timestamps: true });

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ isAdminAction: 1, createdAt: -1 });
activityLogSchema.index({ actionType: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// SiteSettings Schema
const siteSettingsSchema = new mongoose.Schema({
  isFrozen: { type: Boolean, default: false },
  freezeMessage: { type: String, default: 'The website is currently under maintenance. Please check back later.' },
  freezeUntil: { type: Date, default: null },
  frozenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  frozenAt: { type: Date, default: null }
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

// Store OTPs temporarily
const otpStore = new Map();

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    console.log('[REGISTER] New user:', email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      role: isAdmin ? 'admin' : 'user'
    });

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

// Login - SUPPORTS BOTH BCRYPT AND PLAIN TEXT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;
    console.log('[LOGIN] Attempt for:', email, 'Admin:', isAdmin);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // TRY BCRYPT FIRST, THEN PLAIN TEXT (for compatibility)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      // If bcrypt fails, try plain text comparison
      isMatch = user.password === password;
    }
    
    // If bcrypt didn't match, try plain text
    if (!isMatch) {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      console.log('[LOGIN] Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (isAdmin && !user.isAdmin) {
      console.log('[LOGIN] Non-admin trying admin login:', email);
      return res.status(403).json({ message: 'Admin access denied' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('[LOGIN] ✓ Success:', email);
    
    // Log the login activity
    try {
      await ActivityLog.create({
        userId: user._id,
        userEmail: user.email,
        userName: user.name,
        action: user.isAdmin ? 'Admin Login' : 'User Login',
        actionType: 'login',
        details: `${user.isAdmin ? 'Admin' : 'User'} ${user.name} logged in successfully`,
        isAdminAction: user.isAdmin
      });
      console.log('[LOGIN] Activity logged for:', email);
    } catch (logError) {
      console.error('[LOGIN] Failed to log activity:', logError);
    }
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isPermanentAdmin: user.isPermanentAdmin
      },
      token
    });
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    res.status(500).json({ message: 'Login failed: ' + error.message });
  }
});

// Send OTP for password reset
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('[OTP] Request for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('[OTP] User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
    console.log('[OTP] Generated OTP for', email, ':', otp);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - E-Commerce Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #06b6d4;">Password Reset OTP</h2>
          <p>Your OTP code is:</p>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This OTP will expire in 5 minutes.</p>
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

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log('[RESET] Attempt for:', email);

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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    otpStore.delete(email);
    console.log('[RESET] Password updated successfully for:', email);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('[RESET] Error:', error);
    res.status(500).json({ message: 'Failed to reset password: ' + error.message });
  }
});

// ============================================
// PRODUCT ROUTES (WITH MEMORY CACHE)
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    products: productsCache.length 
  });
});

// GET all products (from memory cache)
app.get('/api/products', async (req, res) => {
  console.log(`[GET] ${productsCache.length} products (from memory)`);
  res.json(productsCache);
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  const product = productsCache.find(p => 
    (p.id && p.id === req.params.id) || p._id === req.params.id
  );
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

// POST - Create product
app.post('/api/products', async (req, res) => {
  try {
    console.log('[POST] Creating product:', req.body.name);
    const { _id, adminEmail, ...data } = req.body;
    
    if (!data.category) data.category = 'Uncategorized';
    if (!data.productType) data.productType = 'child';
    if (!data.id) data.id = `admin-product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    
    const product = await Product.create(data);
    const productObj = {
      ...product.toObject(),
      _id: product._id.toString(),
      id: product.id || product._id.toString()
    };
    
    productsCache.push(productObj);
    
    console.log('[POST] ✓ Added to DB:', product.name, '| Cache:', productsCache.length);
    
    // Log admin activity
    try {
      if (adminEmail) {
        const adminUser = await User.findOne({ email: adminEmail, isAdmin: true });
        if (adminUser) {
          await ActivityLog.create({
            userId: adminUser._id,
            userEmail: adminUser.email,
            userName: adminUser.name,
            action: 'Product Created',
            actionType: 'product_add',
            details: `Created product: ${product.name}`,
            isAdminAction: true
          });
        }
      }
    } catch (logError) {
      console.error('[POST] Failed to log activity:', logError);
    }
    
    res.status(201).json(productObj);
  } catch (error) {
    console.error('[POST] Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT - Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('[PUT] Updating:', req.params.id);
    const { _id, adminEmail, ...data } = req.body;
    
    let product = await Product.findOne({ id: req.params.id });
    if (!product && mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id);
    }
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    Object.assign(product, data);
    await product.save();
    
    const productObj = {
      ...product.toObject(),
      _id: product._id.toString(),
      id: product.id || product._id.toString()
    };
    
    const index = productsCache.findIndex(p => p._id === productObj._id || p.id === productObj.id);
    if (index !== -1) productsCache[index] = productObj;
    
    // Log admin activity
    try {
      if (adminEmail) {
        const adminUser = await User.findOne({ email: adminEmail, isAdmin: true });
        if (adminUser) {
          await ActivityLog.create({
            userId: adminUser._id,
            userEmail: adminUser.email,
            userName: adminUser.name,
            action: 'Product Updated',
            actionType: 'product_edit',
            details: `Updated product: ${product.name}`,
            isAdminAction: true
          });
        }
      }
    } catch (logError) {
      console.error('[PUT] Failed to log activity:', logError);
    }
    
    res.json(productObj);
  } catch (error) {
    console.error('[PUT] Error:', error);
    res.status(400).json({ error: 'Failed to update' });
  }
});

// DELETE - Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('[DELETE] Removing:', req.params.id);
    const adminEmail = req.query.adminEmail || req.body.adminEmail;
    
    let product = await Product.findOne({ id: req.params.id });
    if (!product && mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id);
    }
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    const productDbId = product._id.toString();
    const productCustomId = product.id;
    
    const grandchildren = await Product.find({ 
      $or: [{ parentId: productDbId }, { parentId: productCustomId }],
      productType: 'grandchild'
    });
    
    for (const grandchild of grandchildren) {
      await grandchild.deleteOne();
    }
    
    await product.deleteOne();
    
    productsCache = productsCache.filter(p => {
      const isMainProduct = p._id === productDbId || p.id === productCustomId;
      const isGrandchild = p.parentId === productDbId || p.parentId === productCustomId;
      return !isMainProduct && !isGrandchild;
    });
    
    console.log('[DELETE] ✓ Removed:', product.name, '+ grandchildren:', grandchildren.length);
    
    // Log admin activity for product deletion
    if (adminEmail) {
      User.findOne({ email: adminEmail, isAdmin: true }).then(adminUser => {
        if (adminUser) {
          ActivityLog.create({
            userId: adminUser._id,
            userEmail: adminUser.email,
            userName: adminUser.name,
            action: 'Product Deleted',
            actionType: 'product_delete',
            details: `Deleted product: ${product.name}`,
            isAdminAction: true
          }).catch(err => console.error('[LOG] Error:', err));
        }
      }).catch(err => console.error('[LOG] Error finding admin:', err));
    }
    
    res.json({ message: 'Deleted', deletedGrandchildren: grandchildren.length });
  } catch (error) {
    console.error('[DELETE] Error:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// ============================================
// REVIEW ROUTES
// ============================================

app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { viewType } = req.query;
    
    let query = { productId, status: 'approved' };
    if (viewType) query.viewType = viewType;
    
    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
    const reviewsWithId = reviews.map(r => ({
      ...r,
      _id: r._id.toString(),
      id: r._id.toString()
    }));
    
    res.json(reviewsWithId);
  } catch (error) {
    console.error('[GET] Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/api/reviews/user-rating/:productId/:userId/:viewType', async (req, res) => {
  try {
    const { productId, userId, viewType } = req.params;
    const review = await Review.findOne({
      productId,
      userId: decodeURIComponent(userId),
      viewType
    });
    res.json(review ? { rating: review.rating, reviewId: review._id } : { rating: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user rating' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = await Review.create(req.body);
    const reviewObj = {
      ...review.toObject(),
      _id: review._id.toString(),
      id: review._id.toString()
    };
    res.status(201).json(reviewObj);
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit review' });
  }
});

// ============================================
// COMMENT ROUTES
// ============================================

app.get('/api/comments/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { viewType } = req.query;
    
    let query = { productId, status: 'approved' };
    if (viewType) query.viewType = viewType;
    
    const comments = await Comment.find(query).sort({ createdAt: -1 }).lean();
    const commentsWithId = comments.map(c => ({
      ...c,
      _id: c._id.toString(),
      id: c._id.toString()
    }));
    
    res.json(commentsWithId);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    const commentObj = {
      ...comment.toObject(),
      _id: comment._id.toString(),
      id: comment._id.toString()
    };
    res.status(201).json(commentObj);
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit comment' });
  }
});

// ============================================
// CATEGORY ROUTES
// ============================================

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    let category = await Category.findOne({ id: req.params.id });
    if (!category) category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    
    Object.assign(category, req.body);
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    let category = await Category.findOneAndDelete({ id: req.params.id });
    if (!category) category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============================================
// ORDER ROUTES
// ============================================

app.get('/api/orders', async (req, res) => {
  try {
    const { userId, userEmail } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (userEmail) query.customerEmail = userEmail;
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData.orderNumber) {
      orderData.orderNumber = `ORD-${Date.now()}`;
    }
    orderData.estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    orderData.statusHistory = [{
      status: 'pending',
      timestamp: new Date(),
      note: 'Order placed successfully'
    }];
    
    const order = await Order.create(orderData);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create order' });
  }
});

// Track order by ID or order number
app.get('/api/orders/track/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by MongoDB _id first, then by orderNumber
    let order = await Order.findById(identifier).catch(() => null);
    
    if (!order) {
      order = await Order.findOne({ orderNumber: identifier });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('[ORDER TRACKING] Error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// Get single order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    // Add to status history
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order ${status}`
    });
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ============================================
// SLIDER ROUTES
// ============================================

app.get('/api/slides', async (req, res) => {
  try {
    const settings = await AdminSettings.findOne({ key: 'heroSlides' });
    const slides = settings?.value || [];
    
    // If no slides in database, return default slide
    if (slides.length === 0) {
      const defaultSlides = [
        {
          id: '1',
          title: 'Welcome to Our Store',
          description: 'Discover amazing products',
          imageUrl: 'https://picsum.photos/seed/hero1/1200/600',
          buttonText: 'Shop Now',
          linkTo: '/products',
          order: 0,
        }
      ];
      res.json(defaultSlides);
    } else {
      res.json(slides);
    }
  } catch (error) {
    console.error('[SLIDER] Error fetching slides:', error);
    // Return default slide on error
    res.json([
      {
        id: '1',
        title: 'Welcome to Our Store',
        description: 'Discover amazing products',
        imageUrl: 'https://picsum.photos/seed/hero1/1200/600',
        buttonText: 'Shop Now',
        linkTo: '/products',
        order: 0,
      }
    ]);
  }
});

app.post('/api/slides', async (req, res) => {
  try {
    await AdminSettings.findOneAndUpdate(
      { key: 'heroSlides' },
      { key: 'heroSlides', value: req.body, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save slides' });
  }
});

// ============================================
// DISCOUNT ROUTES
// ============================================

app.get('/api/discounts', async (req, res) => {
  try {
    // Return empty array for now - no Discount model defined
    res.json([]);
  } catch (error) {
    console.error('[DISCOUNTS] Error:', error);
    res.json([]);
  }
});

app.post('/api/discounts', async (req, res) => {
  try {
    // Return error for now - no Discount model defined
    res.status(501).json({ error: 'Discount feature not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create discount' });
  }
});

// ============================================
// LOGS ROUTES
// ============================================

// Get admin activity logs
app.get('/api/admin/logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find({ isAdminAction: true })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error('[LOGS] Error fetching admin logs:', error);
    res.json([]);
  }
});

// Get user activity logs
app.get('/api/admin/user-logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find({ isAdminAction: false })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error('[LOGS] Error fetching user logs:', error);
    res.json([]);
  }
});

// Create admin log
app.post('/api/admin/logs', async (req, res) => {
  try {
    const log = await ActivityLog.create({
      ...req.body,
      isAdminAction: true
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('[LOGS] Error creating admin log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// Create user log
app.post('/api/admin/user-logs', async (req, res) => {
  try {
    const log = await ActivityLog.create({
      ...req.body,
      isAdminAction: false
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('[LOGS] Error creating user log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// ============================================
// SITE SETTINGS ROUTES
// ============================================

// Get site settings
app.get('/api/site-settings', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        isFrozen: false,
        freezeMessage: 'The website is currently under maintenance. Please check back later.'
      });
    }
    
    // Auto-unfreeze if time has passed
    if (settings.isFrozen && settings.freezeUntil && new Date() > settings.freezeUntil) {
      settings.isFrozen = false;
      settings.freezeUntil = null;
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('[SITE] Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update site settings (freeze/unfreeze)
app.post('/api/site-settings/freeze', async (req, res) => {
  try {
    const { isFrozen, freezeMessage, freezeDuration, userId, userName, userEmail } = req.body;
    
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }
    
    settings.isFrozen = isFrozen;
    if (freezeMessage) settings.freezeMessage = freezeMessage;
    
    if (isFrozen) {
      settings.frozenBy = userId;
      settings.frozenAt = new Date();
      if (freezeDuration) {
        settings.freezeUntil = new Date(Date.now() + freezeDuration * 60 * 1000);
      } else {
        settings.freezeUntil = null;
      }
      
      // Log freeze action
      await ActivityLog.create({
        userId,
        userEmail,
        userName,
        action: 'Website Frozen',
        actionType: 'freeze',
        details: `Froze website${freezeDuration ? ` for ${freezeDuration} minutes` : ' indefinitely'}: ${freezeMessage}`,
        isAdminAction: true
      });
    } else {
      settings.freezeUntil = null;
      settings.frozenBy = null;
      settings.frozenAt = null;
      
      // Log unfreeze action
      if (userId) {
        await ActivityLog.create({
          userId,
          userEmail,
          userName,
          action: 'Website Unfrozen',
          actionType: 'unfreeze',
          details: 'Unfroze website access',
          isAdminAction: true
        });
      }
    }
    
    await settings.save();
    console.log(`[SITE] Website ${isFrozen ? 'frozen' : 'unfrozen'}`);
    res.json(settings);
  } catch (error) {
    console.error('[SITE] Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ============================================
// NOTIFICATION ROUTES
// ============================================

app.get('/api/notifications', async (req, res) => {
  try {
    const { userId, isAdmin } = req.query;
    let query = {};
    if (isAdmin === 'true') query.isAdminNotification = true;
    else if (userId) query.userId = userId;
    
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    console.log(`[NOTIFICATIONS] Found ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error) {
    console.error('[NOTIFICATIONS] Error fetching notifications:', error);
    res.json([]); // Return empty array instead of error to prevent UI breaking
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create notification' });
  }
});

// Mark single notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    console.error('[NOTIFICATIONS] Error marking as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const { userId, isAdmin } = req.body;
    let query = {};
    if (isAdmin) query.isAdminNotification = true;
    else if (userId) query.userId = userId;
    
    await Notification.updateMany(query, { status: 'read' });
    res.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// ============================================
// STARTUP & DATABASE
// ============================================

async function start() {
  console.log('========================================');
  console.log('  MERGED SERVER - ALL FEATURES');
  console.log('  Auth + Products + Orders + More');
  console.log('========================================');
  
  const server = app.listen(PORT, () => {
    console.log(`✓ Server ready: http://localhost:${PORT}`);
  });
  server.keepAliveTimeout = 120000;
  process.stdin.resume();
  
  console.log('[DB] Connecting to MongoDB...');
  
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2
  }).then(async () => {
    console.log('[DB] ✓ Connected to MongoDB');
    
    // Check for permanent admin
    const adminEmail = 'zainmalik55786@gmail.com';
    const adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      console.log(`[ADMIN] ✓ ${adminEmail} is admin`);
    }
    
    // Load products into cache
    console.log('[DB] Loading products from MongoDB...');
    const products = await Product.find({}).lean();
    productsCache = products.map(p => ({
      ...p,
      _id: p._id.toString(),
      id: p.id || p._id.toString()
    }));
    console.log(`[DB] ✓ Loaded ${productsCache.length} products into cache`);
    
  }).catch((error) => {
    console.error('[DB] ✗ Connection failed:', error.message);
    console.log('[DB] Server will run with limited functionality');
  });
}

process.on('unhandledRejection', (reason) => {
  console.error('[ERROR] Unhandled Rejection:', reason);
});

start();
