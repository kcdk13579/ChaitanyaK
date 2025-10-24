const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  mobile: { type: String },
  paymentStatus: { type: String, enum: ['success', 'failed'], default: 'failed' },
  accessExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Visit', visitSchema);
