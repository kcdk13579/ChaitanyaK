const crypto = require('crypto');

function verifyRazorpaySignature(payload, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expected === signature;
}

module.exports = { verifyRazorpaySignature };
