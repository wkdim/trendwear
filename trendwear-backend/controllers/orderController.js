const Order = require("../models/Order");
const Cart = require("../models/Cart");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/apiError");

// Place order — validates stock against the live product records and
// decrements it, so two customers can't oversell the same last item.
exports.placeOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");
  if (!cart || cart.products.length === 0) throw new ApiError(400, "Cart is empty");

  for (const item of cart.products) {
    if (!item.product) throw new ApiError(400, "A product in your cart no longer exists");
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `${item.product.name} only has ${item.product.stock} left in stock`);
    }
  }

  const total = cart.products.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    products: cart.products,
    totalAmount: total,
  });

  await Promise.all(
    cart.products.map((item) =>
      item.product.updateOne({ $inc: { stock: -item.quantity } })
    )
  );

  cart.products = [];
  await cart.save();

  res.status(201).json(order);
});

// Get user orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate("products.product");
  res.json(orders);
});

// Update order status (Admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.status = req.body.status || order.status;
  await order.save();

  res.json(order);
});
