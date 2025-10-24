const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Payment = require("../models/Payment");
const UserAccess = require("../models/UserAccess");

// ✅ Create Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + Math.floor(Math.random() * 10000),
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      orderId: order.id,
      amount,
      status: "created",
    });

    res.json({ ok: true, order });
  } catch (err) {
    console.error("❌ Create order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ✅ Verify Payment
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      phone,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Create expected signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Invalid signature mismatch");
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Update Payment
    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, status: "captured" },
      { new: true }
    );

    // Create User Access Token
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h

    const access = await UserAccess.create({
      name,
      email,
      phone,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "active",
      createdAt: now,
      expiresAt,
    });

    const token = jwt.sign(
      { accessId: access._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ ok: true, token, expiresAt });
  } catch (err) {
    console.error("❌ Payment verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// ✅ Get all payment records (Admin)
router.get("/all", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

module.exports = router;
