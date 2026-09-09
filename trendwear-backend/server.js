const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const sanitize = require("./middleware/sanitize");
const { apiLimiter } = require("./middleware/rateLimiters");

dotenv.config();
connectDB();

const app = express();

// Security & performance middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      // Kept for the Paystack webhook signature check, which must be
      // computed over the exact raw bytes sent, not the re-serialized body.
      req.rawBody = buf;
    },
  })
);
app.use(sanitize);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Tests import `app` directly (via supertest) without wanting a real port
// bound, so only start listening when this file is run directly.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () =>
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`)
  );

  // Fail loudly instead of leaving the process in a half-broken state.
  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
  process.on("uncaughtException", (err) => {
    console.error(`Uncaught exception: ${err.message}`);
    process.exit(1);
  });
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(() => process.exit(0));
  });
}

module.exports = app;
