const { ApiError } = require('../utils/ApiError');

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const isMalformedJson = err instanceof SyntaxError && err.status === 400 && 'body' in err;
  const isMongooseValidation = err.name === 'ValidationError';
  const isMongooseCast = err.name === 'CastError';
  const isDuplicateKey = err && err.code === 11000;
  const statusCode = isApiError ? err.statusCode : (isMalformedJson || isMongooseValidation || isMongooseCast ? 400 : (isDuplicateKey ? 409 : 500));

  const response = {
    message: isApiError ? err.message : (isMalformedJson ? 'Invalid JSON request body' : (isMongooseValidation || isMongooseCast ? 'Invalid request data' : (isDuplicateKey ? 'A record with this value already exists' : 'Internal Server Error'))),
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    if (!isApiError) response.originalError = err.message;
    if (isApiError && err.meta) response.meta = err.meta;
  }

  res.status(statusCode).json(response);
}

module.exports = { notFound, errorHandler };