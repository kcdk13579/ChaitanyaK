// server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Import routes
const paymentRoutes = require('./routes/payment');
const portfolioRoutes = require('./routes/portfolio');
const adminRoutes = require("./routes/admin");
const webhookRoutes = require('./routes/webhook');

const app = express();

// ==========================
// Global Security Middleware
// ==========================
app.use(helmet({
  contentSecurityPolicy: false, // allows inline scripts in admin-login.html
}));

app.use(morgan('dev'));
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf } })); // Razorpay webhook verification
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://frontend-2i7s448pp-chaitanyas-projects-2ff97aa2.vercel.app",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ==========================
// Rate Limiting (Security)
// ==========================
app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 requests/minute per IP
  message: 'Too many requests, please try again later.'
}));

// ==========================
// Serve Frontend Static Files
// ==========================
const frontendPublic = path.join(__dirname, '..', 'frontend', 'public');
if (fs.existsSync(frontendPublic)) {
  app.use(express.static(frontendPublic));
  app.get('/portfolio.html', (req, res) => res.sendFile(path.join(frontendPublic, 'portfolio.html')));
  app.get('/admin-login.html', (req, res) => res.sendFile(path.join(frontendPublic, 'admin-login.html')));
  app.get('/admin-dashboard.html', (req, res) => res.sendFile(path.join(frontendPublic, 'admin-dashboard.html')));
}

// ==========================
// API Routes
// ==========================
app.use('/api/payment', paymentRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/webhook', webhookRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ ok: true, message: '✅ Backend server is running securely' });
});

// ==========================
// Global Error Handler
// ==========================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ==========================
// MongoDB Connection
// ==========================
const PORT = process.env.PORT || 5500;
if (!process.env.MONGODB_URI) {
  console.error("❌ MongoDB URI not defined in .env file!");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
