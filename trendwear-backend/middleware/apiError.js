// Lightweight error class controllers/validators can throw to control the
// HTTP status code that errorMiddleware responds with, instead of every
// controller hand-rolling res.status(...).json(...) on failure.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
