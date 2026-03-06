const { ApiError } = require('../utils/ApiError');

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

  const response = {
    message: isApiError ? err.message : 'Internal Server Error',
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    if (!isApiError) response.originalError = err.message;
    if (isApiError && err.meta) response.meta = err.meta;
  }

  res.status(statusCode).json(response);
}

module.exports = { notFound, errorHandler };

