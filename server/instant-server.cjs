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
app.get('/api/products', async (req, res) => {
  // If cache is empty, try to fetch directly from MongoDB
  if (productsCache.length === 0) {
    try {
      console.log('[GET] Cache empty, fetching from MongoDB...');
      
      // Use Product model with lean() for better performance
      const products = await Product.find({}).lean().exec();
      productsCache = products.map(p => ({
        ...p,
        _id: p._id.toString()
      }));
      console.log(`[GET] Loaded ${productsCache.length} products from MongoDB`);
    } catch (err) {
      console.error('[GET] Error fetching from MongoDB:', err.message);
    }
  }
  console.log(`[GET] ${productsCache.length} products (from memory)`);
  res.json(productsCache);
});

// GET single product - FROM MEMORY
app.get('/api/products/:id', (req, res) => {
  const product = productsCache.find(p => 
    (p.id && p.id === req.params.id) || p._id.toString() === req.params.id || p._id === req.params.id
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
    
    // Add to memory cache immediately with string _id and custom id
    const cacheObj = {
      ...productObj,
      _id: productObj._id.toString(),
      id: productObj.id || productObj._id.toString()
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
    const { _id, ...data } = req.body;
    
    // Try to find by custom id first, then MongoDB _id (if valid ObjectId)
    let product = await Product.findOne({ id: req.params.id });
    
    if (!product && mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id);
    }
    
    if (!product) {
      console.log('[PUT] Creating new product with id:', req.params.id);
      // Create new product with custom id
      product = new Product({ ...data, id: req.params.id });
      await product.save();
    } else {
      // Update existing product
      Object.assign(product, data);
      await product.save();
    }
    
    // Update in memory cache
    const productObj = {
      ...product.toObject(),
      _id: product._id.toString(),
      id: product.id || product._id.toString()
    };
    const index = productsCache.findIndex(p => {
      return (p.id && p.id === productObj.id) || p._id === productObj._id || p._id === req.params.id;
    });
    if (index !== -1) {
      productsCache[index] = productObj;
      console.log('[PUT] ✓ Updated in cache:', product.name);
    } else {
      // Add to cache if not found
      productsCache.push(productObj);
      console.log('[PUT] ✓ Added to cache:', product.name);
    }
    
    res.json(productObj);
  } catch (error) {
    console.error('[PUT] ✗ Error:', error.message);
    res.status(400).json({ error: 'Failed to update' });
  }
});

// DELETE - Admin removes product (and all its children/grandchildren)
app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('[DELETE] Removing:', req.params.id);
    
    // Try to find by custom id first, then MongoDB _id (if valid ObjectId)
    let product = await Product.findOne({ id: req.params.id });
    
    if (!product && mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id);
    }
    
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    // Get the product's DB ID for finding children
    const productDbId = product._id.toString();
    const productCustomId = product.id;
    
    // Find and delete all grandchildren (color variants) of this product
    const grandchildren = await Product.find({ 
      $or: [
        { parentId: productDbId },
        { parentId: productCustomId }
      ],
      productType: 'grandchild'
    });
    
    console.log('[DELETE] Found', grandchildren.length, 'grandchildren to delete');
    
    // Delete all grandchildren
    for (const grandchild of grandchildren) {
      await grandchild.deleteOne();
      console.log('[DELETE] ✓ Deleted grandchild:', grandchild.name);
    }
    
    // Delete the main product from MongoDB
    await product.deleteOne();
    
    // Remove from memory cache (the product and all its grandchildren)
    const beforeCount = productsCache.length;
    productsCache = productsCache.filter(p => {
      // Remove if it's the deleted product
      const isDeletedProduct = (p.id && p.id === req.params.id) || p._id.toString() === req.params.id;
      // Remove if it's a grandchild of the deleted product
      const isGrandchild = (p.parentId === productDbId || p.parentId === productCustomId) && p.productType === 'grandchild';
      return !isDeletedProduct && !isGrandchild;
    });
    
    console.log('[DELETE] ✓ Removed from DB:', product.name);
    console.log('[DELETE] ✓ Removed', grandchildren.length, 'grandchildren');
    console.log('[DELETE] └─ Cache:', beforeCount, '→', productsCache.length, 'products');
    
    res.json({ message: 'Deleted', deletedGrandchildren: grandchildren.length });
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

// ========== CATEGORY ROUTES ==========

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#06b6d4' },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

// GET - Fetch all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error('[GET] Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST - Create category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, color, imageUrl } = req.body;
    const category = new Category({ name, description, color, imageUrl });
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
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
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
    const category = await Category.findByIdAndDelete(req.params.id);
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

// ========== ORDER ROUTES ==========

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
  discountCode: String,
  discountAmount: { type: Number, default: 0 },
  trackingNumber: String,
  estimatedDelivery: Date
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// GET - Fetch all orders (with optional user filter)
app.get('/api/orders', async (req, res) => {
  try {
    const { userId, userEmail } = req.query;
    let query = {};
    
    // If userId or userEmail provided, filter by user
    if (userId || userEmail) {
      query = {
        $or: []
      };
      if (userId) query.$or.push({ userId });
      if (userEmail) query.$or.push({ customerEmail: userEmail });
      
      // Remove empty $or
      if (query.$or.length === 0) delete query.$or;
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    console.log(`[GET] ${orders.length} orders fetched`);
    res.json({ orders });
  } catch (error) {
    console.error('[GET] Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET - Fetch order by order number (must be before :id route)
app.get('/api/orders/track/:orderNumber', async (req, res) => {
  try {
    // Try to find by orderNumber first, then by _id if it's a valid ObjectId
    let order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      // Check if it's a valid MongoDB ObjectId
      if (req.params.orderNumber.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(req.params.orderNumber);
      }
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('[GET] Error tracking order:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// GET - Fetch single order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('[GET] Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST - Create order
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Generate order number if not provided
    if (!orderData.orderNumber) {
      orderData.orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }
    
    // Set estimated delivery (5 days from now)
    orderData.estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    
    // Add initial status to history
    orderData.statusHistory = [{
      status: 'pending',
      timestamp: new Date(),
      note: 'Order placed successfully'
    }];
    
    const order = await Order.create(orderData);
    console.log('[POST] Order created:', order.orderNumber);
    
    // Create notification for user
    await Notification.create({
      userId: order.userId,
      type: 'order',
      title: 'Order Confirmed! 🎉',
      message: `Your order ${order.orderNumber} has been placed successfully.`,
      meta: `Total: Rs. ${order.totalAmount}`,
      relatedId: order._id.toString(),
      relatedType: 'order'
    });
    
    // Create notification for admin
    await Notification.create({
      type: 'order',
      isAdminNotification: true,
      title: 'New Order Received',
      message: `Order ${order.orderNumber} from ${order.customerName}`,
      meta: `Total: Rs. ${order.totalAmount}`,
      relatedId: order._id.toString(),
      relatedType: 'order'
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('[POST] Error creating order:', error);
    res.status(400).json({ error: 'Failed to create order', details: error.message });
  }
});

// PATCH - Update order status (Admin)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    
    const updateData = { 
      status,
      $push: { 
        statusHistory: { 
          status, 
          timestamp: new Date(), 
          note: note || `Status updated to ${status}` 
        } 
      }
    };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('[PATCH] Order status updated:', order.orderNumber, '->', status);
    
    // Create notification for customer
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      processing: 'Your order is being processed.',
      shipped: 'Your order has been shipped!',
      out_for_delivery: 'Your order is out for delivery!',
      delivered: 'Your order has been delivered! 🎉',
      cancelled: 'Your order has been cancelled.'
    };
    
    await Notification.create({
      userId: order.userId,
      type: 'order',
      title: `Order ${status.replace('_', ' ').toUpperCase()}`,
      message: statusMessages[status] || `Order ${order.orderNumber} status: ${status}`,
      meta: trackingNumber ? `Tracking: ${trackingNumber}` : undefined,
      relatedId: order._id.toString(),
      relatedType: 'order'
    });
    
    res.json(order);
  } catch (error) {
    console.error('[PATCH] Error updating order:', error);
    res.status(400).json({ error: 'Failed to update order' });
  }
});

// ========== NOTIFICATION ROUTES ==========

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['order', 'product', 'reward', 'system', 'reply', 'contact', 'inventory', 'feedback', 'admin_action', 'recommendation'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  meta: String,
  status: { type: String, enum: ['new', 'read'], default: 'new' },
  isAdminNotification: { type: Boolean, default: false },
  relatedId: String,
  relatedType: String,
  linkTo: String
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

// GET - Fetch notifications (user or admin)
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId, isAdmin } = req.query;
    
    let query = {};
    if (isAdmin === 'true') {
      query.isAdminNotification = true;
    } else if (userId) {
      query.$or = [
        { userId: userId },
        { userId: null, isAdminNotification: false }
      ];
    }
    
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    console.log(`[GET] ${notifications.length} notifications fetched`);
    res.json(notifications);
  } catch (error) {
    console.error('[GET] Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST - Create notification
app.post('/api/notifications', async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    console.log('[POST] Notification created:', notification.title);
    res.status(201).json(notification);
  } catch (error) {
    console.error('[POST] Error creating notification:', error);
    res.status(400).json({ error: 'Failed to create notification' });
  }
});

// PATCH - Mark notification as read
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
    console.error('[PATCH] Error updating notification:', error);
    res.status(400).json({ error: 'Failed to update notification' });
  }
});

// PATCH - Mark all notifications as read
app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const { userId, isAdmin } = req.body;
    
    let query = { status: 'new' };
    if (isAdmin) {
      query.isAdminNotification = true;
    } else if (userId) {
      query.userId = userId;
    }
    
    await Notification.updateMany(query, { status: 'read' });
    console.log('[PATCH] All notifications marked as read');
    res.json({ success: true });
  } catch (error) {
    console.error('[PATCH] Error marking notifications as read:', error);
    res.status(400).json({ error: 'Failed to update notifications' });
  }
});

// ========== FEEDBACK/CONTACT ROUTES ==========

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  type: { type: String, enum: ['contact', 'feedback', 'complaint', 'suggestion'], default: 'feedback' },
  subject: String,
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'resolved'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  adminReply: String,
  repliedAt: Date
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

// GET - Fetch all feedback (admin)
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    console.log(`[GET] ${feedback.length} feedback items fetched`);
    res.json(feedback);
  } catch (error) {
    console.error('[GET] Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// POST - Submit feedback (user)
app.post('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    console.log('[POST] Feedback submitted:', feedback.subject || 'No subject');
    
    // Notify admin
    await Notification.create({
      type: 'feedback',
      isAdminNotification: true,
      title: 'New Feedback Received',
      message: `${feedback.userName}: ${feedback.subject || feedback.message.substring(0, 50)}`,
      meta: feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1),
      relatedId: feedback._id.toString(),
      relatedType: 'feedback'
    });
    
    res.status(201).json(feedback);
  } catch (error) {
    console.error('[POST] Error submitting feedback:', error);
    res.status(400).json({ error: 'Failed to submit feedback' });
  }
});

// PATCH - Reply to feedback (admin)
app.patch('/api/feedback/:id/reply', async (req, res) => {
  try {
    const { reply, status } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { 
        adminReply: reply, 
        repliedAt: new Date(),
        status: status || 'resolved'
      },
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    console.log('[PATCH] Feedback replied:', feedback._id);
    
    // Notify user
    if (feedback.userId) {
      await Notification.create({
        userId: feedback.userId,
        type: 'reply',
        title: 'Your feedback has been answered!',
        message: reply.substring(0, 100) + (reply.length > 100 ? '...' : ''),
        relatedId: feedback._id.toString(),
        relatedType: 'feedback'
      });
    }
    
    res.json(feedback);
  } catch (error) {
    console.error('[PATCH] Error replying to feedback:', error);
    res.status(400).json({ error: 'Failed to reply to feedback' });
  }
});

// ========== DISCOUNT ROUTES ==========

// Discount Schema
const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  maxUses: { type: Number, default: null },
  usageCount: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Discount = mongoose.model('Discount', discountSchema);

// GET - Fetch all discounts (admin)
app.get('/api/discounts', async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    console.error('[GET] Error fetching discounts:', error);
    res.status(500).json({ error: 'Failed to fetch discounts' });
  }
});

// POST - Create discount (admin)
app.post('/api/discounts', async (req, res) => {
  try {
    const discount = await Discount.create(req.body);
    console.log('[POST] Discount created:', discount.code);
    res.status(201).json(discount);
  } catch (error) {
    console.error('[POST] Error creating discount:', error);
    res.status(400).json({ error: 'Failed to create discount', details: error.message });
  }
});

// POST - Validate discount code
app.post('/api/discounts/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    
    const discount = await Discount.findOne({ 
      code: code.toUpperCase(), 
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!discount) {
      return res.status(404).json({ valid: false, error: 'Invalid or expired discount code' });
    }
    
    if (discount.maxUses && discount.usageCount >= discount.maxUses) {
      return res.status(400).json({ valid: false, error: 'Discount code has reached maximum uses' });
    }
    
    if (orderTotal < discount.minOrder) {
      return res.status(400).json({ valid: false, error: `Minimum order of Rs. ${discount.minOrder} required` });
    }
    
    const discountAmount = discount.type === 'percentage' 
      ? (orderTotal * discount.value / 100)
      : discount.value;
    
    res.json({ 
      valid: true, 
      discount,
      discountAmount: Math.min(discountAmount, orderTotal)
    });
  } catch (error) {
    console.error('[POST] Error validating discount:', error);
    res.status(500).json({ error: 'Failed to validate discount' });
  }
});

// DELETE - Delete discount (admin)
app.delete('/api/discounts/:id', async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    console.log('[DELETE] Discount deleted:', discount.code);
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('[DELETE] Error deleting discount:', error);
    res.status(500).json({ error: 'Failed to delete discount' });
  }
});

// ========== REVIEW ROUTES ==========

// Review Schema
const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: String,
  userId: String, // Changed to String for email
  userName: { type: String, required: true },
  userEmail: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String, // Made optional since rating can be standalone
  viewType: { type: String, enum: ['gallery', 'immersive', null], default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }, // Auto-approve
  replied: { type: Boolean, default: false },
  replyText: String,
  repliedAt: Date
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: String,
  userId: String, // Email
  userName: { type: String, required: true },
  userEmail: String,
  comment: { type: String, required: true },
  viewType: { type: String, enum: ['gallery', 'immersive', null], default: null },
  parentCommentId: String, // For nested replies
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

// GET - Fetch all reviews (admin)
app.get('/api/reviews', async (req, res) => {
  try {
    const { productId, status } = req.query;
    let query = {};
    if (productId) query.productId = productId;
    if (status) query.status = status;
    
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('[GET] Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST - Submit review (user)
app.post('/api/reviews', async (req, res) => {
  try {
    const review = await Review.create(req.body);
    console.log('[POST] Review submitted for product:', review.productId);
    
    // Notify admin
    await Notification.create({
      type: 'feedback',
      isAdminNotification: true,
      title: 'New Product Review',
      message: `${review.userName} rated ${review.productName || 'a product'} ${review.rating}/5 stars`,
      meta: review.comment ? review.comment.substring(0, 50) : `${review.rating}/5 stars`,
      relatedId: review._id.toString(),
      relatedType: 'review'
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('[POST] Error submitting review:', error);
    res.status(400).json({ error: 'Failed to submit review' });
  }
});

// PATCH - Update review status (admin)
app.patch('/api/reviews/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    console.log('[PATCH] Review status updated:', review._id, '->', status);
    res.json(review);
  } catch (error) {
    console.error('[PATCH] Error updating review:', error);
    res.status(400).json({ error: 'Failed to update review' });
  }
});

// PATCH - Reply to review (admin)
app.patch('/api/reviews/:id/reply', async (req, res) => {
  try {
    const { replyText } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { replied: true, replyText, repliedAt: new Date() },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Notify user
    if (review.userId) {
      await Notification.create({
        userId: review.userId,
        type: 'reply',
        title: 'Your review got a reply!',
        message: replyText.substring(0, 100),
        relatedId: review.productId,
        relatedType: 'product',
        linkTo: `/products/${review.productId}`
      });
    }
    
    console.log('[PATCH] Review replied:', review._id);
    res.json(review);
  } catch (error) {
    console.error('[PATCH] Error replying to review:', error);
    res.status(400).json({ error: 'Failed to reply to review' });
  }
});

// GET - Fetch reviews for a specific product (filtered by viewType)
app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { viewType } = req.query;
    
    let query = { productId, status: 'approved' };
    if (viewType) {
      query.viewType = viewType;
    }
    
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    console.log(`[GET] Found ${reviews.length} reviews for product ${productId} (viewType: ${viewType})`);
    res.json(reviews);
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

// ========== COMMENTS ROUTES ==========

// GET - Fetch comments for a specific product (filtered by viewType)
app.get('/api/comments/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { viewType } = req.query;
    
    let query = { productId, status: 'approved' };
    if (viewType) {
      query.viewType = viewType;
    }
    
    const comments = await Comment.find(query).sort({ createdAt: -1 });
    console.log(`[GET] Found ${comments.length} comments for product ${productId} (viewType: ${viewType})`);
    res.json(comments);
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
    
    // Notify admin
    await Notification.create({
      type: 'feedback',
      isAdminNotification: true,
      title: 'New Product Comment',
      message: `${comment.userName} commented on ${comment.productName || 'a product'}`,
      meta: comment.comment.substring(0, 50),
      relatedId: comment._id.toString(),
      relatedType: 'comment'
    });
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('[POST] Error submitting comment:', error);
    res.status(400).json({ error: 'Failed to submit comment' });
  }
});

// PATCH - Update comment status (admin)
app.patch('/api/comments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    console.log('[PATCH] Comment status updated:', comment._id, '->', status);
    res.json(comment);
  } catch (error) {
    console.error('[PATCH] Error updating comment:', error);
    res.status(400).json({ error: 'Failed to update comment' });
  }
});

// DELETE - Delete comment (admin)
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    console.log('[DELETE] Comment deleted:', comment._id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('[DELETE] Error deleting comment:', error);
    res.status(400).json({ error: 'Failed to delete comment' });
  }
});

// ========== ADMIN LOGS ROUTES ==========

// Admin Log Schema
const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminEmail: String,
  action: { type: String, required: true },
  description: String,
  targetType: String,
  targetId: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

// GET - Fetch admin logs
app.get('/api/admin/logs', async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error('[GET] Error fetching admin logs:', error);
    res.status(500).json({ error: 'Failed to fetch admin logs' });
  }
});

// POST - Create admin log
app.post('/api/admin/logs', async (req, res) => {
  try {
    const log = await AdminLog.create(req.body);
    console.log('[POST] Admin log created:', log.action);
    res.status(201).json(log);
  } catch (error) {
    console.error('[POST] Error creating admin log:', error);
    res.status(400).json({ error: 'Failed to create log' });
  }
});

// ========== USER ACTIVITY LOGS ==========

// User Log Schema
const userLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: String,
  action: { type: String, required: true },
  description: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const UserLog = mongoose.model('UserLog', userLogSchema);

// GET - Fetch user logs
app.get('/api/admin/user-logs', async (req, res) => {
  try {
    const logs = await UserLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error('[GET] Error fetching user logs:', error);
    res.status(500).json({ error: 'Failed to fetch user logs' });
  }
});

// POST - Create user log
app.post('/api/admin/user-logs', async (req, res) => {
  try {
    const log = await UserLog.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    console.error('[POST] Error creating user log:', error);
    res.status(400).json({ error: 'Failed to create log' });
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
        
        // Use mongoose Product model with lean()
        const productsRaw = await Product.find({}).lean().exec();
        
        productsCache = productsRaw.map(p => ({
          _id: p._id.toString(),
          id: p.id || p._id.toString(), // Include custom id
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

// Error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise);
  console.error('[ERROR] Reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  process.exit(1);
});

start();
