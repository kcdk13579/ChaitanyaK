const Razorpay = require('razorpay');
require('dotenv').config();

const client = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = client;
