const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const User = require("../models/User");

// Verifies the bearer JWT and loads the real user from the DB so
// req.user._id / req.user.role are always correct and up to date
// (controllers like cartController/orderController rely on req.user._id).
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-passwordHash");

  if (!user) {
    return res.status(401).json({ message: "Not authorized, user not found" });
  }

  req.user = user;
  next();
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Not authorized as admin" });
};

module.exports = { protect, admin };
