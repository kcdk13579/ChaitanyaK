const mongoose = require('mongoose');

const UserAccessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  orderId: { type: String },
  paymentId: { type: String },
  status: { type: String, enum: ['active','expired','failed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

UserAccessSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index (requires expiresAt field to be in Date)

module.exports = mongoose.model('UserAccess', UserAccessSchema);
