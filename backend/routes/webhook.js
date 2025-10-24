const express = require('express');
const router = express.Router();
const { verifyRazorpaySignature } = require('../utils/verifySignature');
const Payment = require('../models/Payment');
const UserAccess = require('../models/UserAccess');

router.post('/', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const payload = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

  if (!verifyRazorpaySignature(payload, signature, secret)) {
    return res.status(400).send('invalid signature');
  }

  const event = req.body.event;
  const payloadData = req.body.payload || {};

  try {
    if (event === 'payment.captured') {
      const paymentEntity = payloadData.payment && payloadData.payment.entity;
      await Payment.findOneAndUpdate({ orderId: paymentEntity.order_id }, {
        paymentId: paymentEntity.id,
        status: paymentEntity.status,
        raw: paymentEntity
      }, { upsert: true });

      // ensure access exists (idempotent)
      const existing = await UserAccess.findOne({ orderId: paymentEntity.order_id });
      if (!existing) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24*60*60*1000);
        await UserAccess.create({
          name: paymentEntity.contact || 'unknown',
          email: paymentEntity.email || '',
          phone: paymentEntity.contact || '',
          orderId: paymentEntity.order_id,
          paymentId: paymentEntity.id,
          status: 'active',
          createdAt: now,
          expiresAt
        });
      }
    } else if (event === 'payment.failed') {
      const p = payloadData.payment && payloadData.payment.entity;
      await Payment.findOneAndUpdate({ orderId: p.order_id }, { status: 'failed', raw: p }, { upsert: true });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
