const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const router = express.Router();

// ✅ Admin login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || admin.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ ok: true, token });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
