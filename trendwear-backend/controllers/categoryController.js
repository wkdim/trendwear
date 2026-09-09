const Category = require("../models/Category");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/apiError");

// Create Category (Admin)
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.status(201).json(category);
});

// Get all categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// Delete Category (Admin)
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ message: "Category deleted" });
});
