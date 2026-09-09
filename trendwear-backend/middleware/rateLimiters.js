const rateLimit = require("express-rate-limit");

// Slows down brute-force attempts against login/register without affecting
// normal shoppers browsing products/cart.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});

// Looser general limiter for the rest of the API.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

module.exports = { authLimiter, apiLimiter };
