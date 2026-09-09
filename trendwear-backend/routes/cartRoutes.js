const express = require("express");
const { getCart, addToCart, removeFromCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");
const { cartAddRules, idParamRules, validate } = require("../middleware/validators");

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, cartAddRules, validate, addToCart);
router.delete("/:id", protect, idParamRules, validate, removeFromCart);

module.exports = router;
