// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Import models
const { User, Book, Cart } = require('./models.js');

// Initialize app
const app = express();

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'html')));

// DEFINE THESE AT THE TOP - GLOBALLY
const JWT_SECRET = process.env.JWT_SECRET || 'sweet-imagica-secret-key-2024';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'adminisusername';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpassword786';
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-flipbook';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dcdhsyj86';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '921185953673167';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'P-Vro4fA8_gF9dnTcHgKnOQ-xGI';

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Cloudinary Config
cloudinary.config({ 
  cloud_name: CLOUDINARY_CLOUD_NAME, 
  api_key: CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_API_SECRET 
});

// ============ AUTHENTICATION ROUTES ============

// Register - Normal users are not admin by default
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      email,
      password: hashedPassword,
      username: username || email.split('@')[0],
      isAdmin: false // Regular users are not admin
    });
    
    await user.save();
    
    const token = jwt.sign({ 
      userId: user._id, 
      email: user.email,
      isAdmin: false
    }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username || email.split('@')[0],
        isAdmin: false
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login - SINGLE LOGIN ROUTE with admin check
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username }); // Debug log
    
    
    // Check if admin credentials (exact match)
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log('Admin login detected'); // Debug log
      
      // Check if admin user exists in database
      let adminUser = await User.findOne({ username: ADMIN_USERNAME });
      
      if (!adminUser) {
        console.log('Creating admin user...'); // Debug log
        // Create admin user if doesn't exist
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        adminUser = new User({
          username: ADMIN_USERNAME,
          email: 'admin@sweetimagica.com',
          password: hashedPassword,
          isAdmin: true
        });
        await adminUser.save();
        console.log('Admin user created'); // Debug log
      }
      
      const token = jwt.sign({ 
        userId: adminUser._id, 
        email: adminUser.email,
        isAdmin: true 
      }, JWT_SECRET, { expiresIn: '7d' });
      
      console.log('Admin login successful'); // Debug log
      
      return res.json({ 
        success: true, 
        token,
        user: {
          id: adminUser._id,
          email: adminUser.email,
          username: adminUser.username,
          isAdmin: true
        }
      });
    }
    
    // Regular user login
    console.log('Checking regular user...'); // Debug log
    
    const user = await User.findOne({ 
      $or: [{ email: username }, { username: username }] 
    });
    
    if (!user) {
      console.log('User not found'); // Debug log
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password'); // Debug log
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ 
      userId: user._id, 
      email: user.email,
      isAdmin: user.isAdmin || false
    }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('Regular user login successful'); // Debug log
    
    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username || user.email.split('@')[0],
        isAdmin: user.isAdmin || false
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify Token Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get Current User
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ CART ROUTES ============

// Get Cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userID: req.user.userId }).populate('items.bookID');
    
    if (!cart) {
      cart = new Cart({ userID: req.user.userId, items: [] });
      await cart.save();
    }
    
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add to Cart
app.post('/api/cart/add', authenticateToken, async (req, res) => {
  try {
    const { bookData } = req.body;
    
    const book = new Book({
      type: 'custom',
      title: `${bookData.childName}'s Story`,
      price: parseFloat(bookData.totalPrice.replace('$', '')),
      userID: req.user.userId,
      customData: bookData,
      status: 'pending'
    });
    
    await book.save();
    
    let cart = await Cart.findOne({ userID: req.user.userId });
    
    if (!cart) {
      cart = new Cart({ userID: req.user.userId, items: [] });
    }
    
    cart.items.push({ bookID: book._id, quantity: 1 });
    await cart.save();
    
    res.json({ success: true, cart, bookId: book._id });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove from Cart
app.delete('/api/cart/remove/:itemId', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userID: req.user.userId });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();
    
    res.json({ success: true, cart });
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Clear Cart
app.delete('/api/cart/clear', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userID: req.user.userId });
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.json({ success: true, message: 'Cart cleared' });
    
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ ORDER ROUTES ============

// Complete Order
app.post('/api/order/complete', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userID: req.user.userId }).populate('items.bookID');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    
    // Update all books to completed status
    for (const item of cart.items) {
      const book = await Book.findById(item.bookID);
      if (book) {
        book.status = 'completed';
        book.orderDate = new Date();
        await book.save();
      }
    }
    
    // Clear cart
    cart.items = [];
    await cart.save();
    
    res.json({ 
      success: true, 
      message: 'Order completed successfully',
      orderId: `ORDER-${Date.now()}`
    });
    
  } catch (error) {
    console.error('Order completion error:', error);
    res.status(500).json({ success: false, message: 'Order failed' });
  }
});

// Get User Orders (Downloads)
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Book.find({ 
      userID: req.user.userId, 
      status: 'completed',
      downloadPath: { $exists: true, $ne: null }
    });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ ADMIN ROUTES ============

// Get All Orders (Admin)
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await Book.find().populate('userID', 'username email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Order Status (Admin)
app.put('/api/admin/orders/:orderId', async (req, res) => {
  try {
    const { status, downloadPath } = req.body;
    
    const book = await Book.findById(req.params.orderId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (status) book.status = status;
    if (downloadPath) book.downloadPath = downloadPath;
    
    await book.save();
    
    res.json({ success: true, book });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ FILE UPLOAD ROUTES ============

app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
    if (error) {
      console.error('Cloudinary error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    res.json({ success: true, url: result.secure_url });
  }).end(req.file.buffer);
});

// ============ STATIC PAGE ROUTES ============

app.get('/', (req, res) => res.redirect('/homepage'));

app.get('/:page', (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, 'html', `${page}.html`), (err) => {
    if (err) res.sendFile(path.join(__dirname, 'html', 'homepage.html'));
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📊 MongoDB Database: my-flipbook');
  console.log('✅ All routes initialized');
  console.log('');
  console.log('👑 ADMIN CREDENTIALS:');
  console.log(`   Username: ${ADMIN_USERNAME}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('');
});