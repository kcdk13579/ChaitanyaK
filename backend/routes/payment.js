// routes/payment.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Payment = require("../models/Payment");
const UserAccess = require("../models/UserAccess");

// ================================
// ✅ Razorpay Instance
// ================================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================================
// ✅ Create Razorpay Order
// ================================
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      orderId: order.id,
      amount,
      currency: "INR",
      status: "created",
    });

    console.log("✅ Razorpay order created:", order.id);
    res.json({ ok: true, order });
  } catch (err) {
    console.error("❌ Create Order Error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ================================
// ✅ Verify Razorpay Payment
// ================================
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
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch");
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Update Payment Status
    const paymentRecord = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, status: "captured" },
      { new: true }
    );

    if (!paymentRecord) {
      console.warn("⚠️ No matching order found in DB for:", razorpay_order_id);
    }

    // Generate user access record
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hrs

    const userAccess = await UserAccess.create({
      name,
      email,
      phone,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "active",
      createdAt: now,
      expiresAt,
    });

    // JWT token for 24 hours access
    const token = jwt.sign(
      { accessId: userAccess._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("✅ Payment verified successfully:", razorpay_payment_id);
    res.json({ ok: true, token, expiresAt });
  } catch (err) {
    console.error("❌ Payment Verification Error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

// ================================
// ✅ Fetch All Payments (Admin)
// ================================
router.get("/all", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json({ ok: true, payments });
  } catch (err) {
    console.error("❌ Fetch Payments Error:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// ================================
// ✅ Default Route for Health Check
// ================================
router.get("/", (req, res) => {
  res.json({ ok: true, message: "Payment API working fine ✅" });
});

module.exports = router;
