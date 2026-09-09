const express = require("express");
const {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  productRules,
  productUpdateRules,
  idParamRules,
  validate,
} = require("../middleware/validators");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", idParamRules, validate, getProduct);

router.post("/", protect, admin, productRules, validate, addProduct);
router.post(
  "/upload",
  protect,
  admin,
  upload.single("image"),
  uploadProductImage
);
router.put("/:id", protect, admin, productUpdateRules, validate, updateProduct);
router.delete("/:id", protect, admin, idParamRules, validate, deleteProduct);

module.exports = router;
