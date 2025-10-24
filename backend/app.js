// app.js
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// Import routes
const paymentRoutes = require('./routes/payment');
const portfolioRoutes = require('./routes/portfolio');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhook');

const app = express();

// Security & logging
app.use(helmet());
app.use(morgan('dev'));

// Body parsing
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf } })); // For webhook signature verification
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60
});
app.use(limiter);

// Routes
app.use('/api/payment', paymentRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/webhook', webhookRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ ok: true, message: '✅ Backend server is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
