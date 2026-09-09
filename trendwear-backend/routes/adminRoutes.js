const express = require("express");
const { getDashboard, getUsers, getOrders } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, admin, getDashboard);
router.get("/users", protect, admin, getUsers);
router.get("/orders", protect, admin, getOrders);

module.exports = router;
