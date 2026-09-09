const express = require("express");
const { createCategory, getCategories, deleteCategory } = require("../controllers/categoryController");
const { protect, admin } = require("../middleware/authMiddleware");
const { categoryRules, idParamRules, validate } = require("../middleware/validators");

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, admin, categoryRules, validate, createCategory);
router.delete("/:id", protect, admin, idParamRules, validate, deleteCategory);

module.exports = router;
