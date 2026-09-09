// 404 handler — mounted after all real routes, turns an unmatched route
// into a normal error that flows through errorHandler below.
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Centralized error handler. Every controller/middleware in this app calls
// next(err) (directly, via asyncHandler, or by throwing an ApiError) rather
// than formatting its own error response, so this is the single place that
// decides status codes and response shape.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";

  // Mongoose: invalid ObjectId in a route param like /api/products/:id
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found`;
  }

  // Mongoose: unique index violation (e.g. duplicate email/category name)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} is already in use`;
  }

  // Mongoose: schema validation failure
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Malformed or expired JWT
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Not authorized, invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Not authorized, token expired";
  }

  if (statusCode < 400) statusCode = 500;

  res.status(statusCode).json({
    message,
    // Never leak stack traces to clients outside development.
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
