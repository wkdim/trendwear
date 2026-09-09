const express = require("express");
const { placeOrder, getMyOrders, updateOrderStatus } = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");
const { orderStatusRules, validate } = require("../middleware/validators");

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/myorders", protect, getMyOrders);
router.put("/:id", protect, admin, orderStatusRules, validate, updateOrderStatus);

module.exports = router;
