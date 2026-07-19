const { ApiError } = require('../utils/ApiError');

const BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function cleanValue(value) {
  if (typeof value === 'string') {
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/<[^>]*>/g, '').trim();
  }
  if (Array.isArray(value)) return value.map(cleanValue);
  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, child] of Object.entries(value)) {
      if (BLOCKED_KEYS.has(key) || key.startsWith('$') || key.includes('.')) {
        throw new ApiError(400, 'Invalid request field');
      }
      result[key] = cleanValue(child);
    }
    return result;
  }
  return value;
}

function sanitizeRequest(req, _res, next) {
  try {
    if (req.body && typeof req.body === 'object') req.body = cleanValue(req.body);
    if (req.query && typeof req.query === 'object') req.query = cleanValue(req.query);
    next();
  } catch (error) {
    next(error);
  }
}

function preventParameterPollution(req, _res, next) {
  const hasArrayValue = Object.values(req.query || {}).some(Array.isArray);
  if (hasArrayValue) return next(new ApiError(400, 'Duplicate query parameters are not allowed'));
  return next();
}

module.exports = { sanitizeRequest, preventParameterPollution };