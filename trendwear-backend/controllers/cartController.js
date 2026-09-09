const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/apiError");

// Get user cart
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");
  res.json(cart || { user: req.user._id, products: [] });
});

// Add product to cart
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, products: [{ product: productId, quantity }] });
  } else {
    const itemIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (itemIndex > -1) {
      cart.products[itemIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
    await cart.save();
  }

  cart = await cart.populate("products.product");
  res.json(cart);
});

// Remove product
exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.products = cart.products.filter(p => p.product.toString() !== req.params.id);
  await cart.save();

  const populated = await cart.populate("products.product");
  res.json(populated);
});
