const { ApiError } = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const { env } = require('../config/env');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  try {
    const decoded = verifyToken(token, env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (e) {
    return next(new ApiError(401, 'Invalid token'));
  }
}

function adminOnly(req, res, next) {
  if (!req.user) return next(new ApiError(401, 'Unauthorized'));
  if (req.user.role !== 'admin') return next(new ApiError(403, 'Forbidden'));
  return next();
}

module.exports = { authRequired, adminOnly };

