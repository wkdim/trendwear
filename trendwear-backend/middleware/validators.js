const { body, param, query, validationResult } = require("express-validator");

// Runs after a chain of express-validator checks; returns a clean 400 with
// per-field messages instead of letting a bad request reach a controller.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const isObjectId = (field, location = param) =>
  location(field).isMongoId().withMessage(`${field} must be a valid id`);

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const productRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
];

const productUpdateRules = [isObjectId("id"), ...productRules.map((r) => r.optional())];

const categoryRules = [
  body("name").trim().notEmpty().withMessage("Category name is required"),
];

const cartAddRules = [
  body("productId").isMongoId().withMessage("productId must be a valid id"),
  body("quantity").optional().isInt({ min: 1 }).withMessage("quantity must be a positive integer"),
];

const orderStatusRules = [
  isObjectId("id"),
  body("status")
    .isIn(["pending", "shipped", "delivered"])
    .withMessage("status must be one of pending, shipped, delivered"),
];

const paymentInitiateRules = [
  body("orderId").isMongoId().withMessage("orderId must be a valid id"),
  body("email").trim().isEmail().withMessage("A valid email is required"),
];

const paymentVerifyRules = [
  body("reference").trim().notEmpty().withMessage("reference is required"),
  body("orderId").isMongoId().withMessage("orderId must be a valid id"),
];

const idParamRules = [isObjectId("id")];

module.exports = {
  validate,
  registerRules,
  loginRules,
  productRules,
  productUpdateRules,
  categoryRules,
  cartAddRules,
  orderStatusRules,
  paymentInitiateRules,
  paymentVerifyRules,
  idParamRules,
  query,
};
