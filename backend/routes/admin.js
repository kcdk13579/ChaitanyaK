const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Payment = require("../models/Payment");
const UserAccess = require("../models/UserAccess");

// ==========================
// Middleware: Verify JWT Token
// ==========================
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// ==========================
// Admin Login (Restricted to .env admin only)
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ Check if admin username matches environment variable
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(400).json({ error: "Unauthorized admin" });
    }

    // ✅ Find admin user in DB
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ error: "Admin not found" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ ok: true, token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ==========================
// Dashboard Stats (Payments Summary)
// ==========================
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments({ status: "captured" });
    const totalRevenueAgg = await Payment.aggregate([
      { $match: { status: "captured" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    res.json({ totalPayments, totalRevenue });
  } catch (err) {
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// ==========================
// Users List
// ==========================
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await UserAccess.find().sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to load users" });
  }
});

// ==========================
// Payments List
// ==========================
router.get("/payments", verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch {
    res.status(500).json({ error: "Failed to load payments" });
  }
});

module.exports = router;
