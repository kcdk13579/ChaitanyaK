const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserAccess = require('../models/UserAccess');

// Protected: check token
router.get('/check', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const access = await UserAccess.findById(decoded.accessId);
    if (!access) return res.status(401).json({ error: 'No access' });
    if (new Date() > access.expiresAt) return res.status(401).json({ error: 'Expired' });
    return res.json({ ok: true, access: { name: access.name, expiresAt: access.expiresAt } });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// public count of total viewers (successful accesses)
router.get('/count', async (req, res) => {
  const count = await UserAccess.countDocuments({ status: 'active' });
  res.json({ count });
});

module.exports = router;
