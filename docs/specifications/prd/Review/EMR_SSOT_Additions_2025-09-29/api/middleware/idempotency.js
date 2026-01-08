// Idempotency middleware (Express)
const crypto = require('crypto');

module.exports = function idempotency(required = true) {
  return async function(req, res, next) {
    const key = req.header('Idempotency-Key');
    if (required && !key) return res.status(400).json({ error: 'missing_idempotency_key' });
    req.idempotencyKey = key;
    next();
  };
};
