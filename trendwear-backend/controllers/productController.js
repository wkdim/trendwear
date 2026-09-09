const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/apiError");

// Add Product (Admin only)
exports.addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, image } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    image,
  });

  res.status(201).json(product);
});

// Get All Products — supports ?search=, ?category=, ?page=, ?limit=
exports.getProducts = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);

  const filter = {};
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: "i" };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  });
});

// Get Single Product
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.json(product);
});

// Update Product (Admin only)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, "Product not found");
  res.json(product);
});

// Delete Product (Admin only)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ message: "Product removed" });
});

// Upload a product image (Admin only) — streams the buffered file from
// multer straight to Cloudinary and returns the hosted URL for the admin
// UI to save on the product's `image` field.
exports.uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "trendwear/products" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  res.status(201).json({ url: uploadResult.secure_url });
});
