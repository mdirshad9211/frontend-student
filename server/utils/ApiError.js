class ApiError extends Error {
  constructor(statusCode, message, meta) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.meta = meta;
  }
}

module.exports = { ApiError };

