const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  amount: Number,
  currency: String,
  status: String,
  method: String,
  raw: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
