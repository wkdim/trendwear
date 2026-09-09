const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Category = require("../models/Category");
const asyncHandler = require("../middleware/asyncHandler");

// Dashboard summary
exports.getDashboard = asyncHandler(async (req, res) => {
  const [users, orders, products, categories] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments(),
    Category.countDocuments(),
  ]);

  res.json({ users, orders, products, categories });
});

// Get all users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-passwordHash");
  res.json(users);
});

// Get all orders
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "-passwordHash").populate("products.product");
  res.json(orders);
});
