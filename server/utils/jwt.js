const jwt = require('jsonwebtoken');

function signToken(payload, secret, options = {}) {
  return jwt.sign(payload, secret, { expiresIn: '7d', ...options });
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };

