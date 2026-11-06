const express = require("express");
const { initiatePayment, verifyPayment, paystackWebhook } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const {
  paymentInitiateRules,
  paymentVerifyRules,
  validate,
} = require("../middleware/validators");

const router = express.Router();

router.post("/initiate", protect, paymentInitiateRules, validate, initiatePayment);
router.post("/verify", protect, paymentVerifyRules, validate, verifyPayment);
// No auth: this is called by Paystack's servers. Trust is established via
// the x-paystack-signature HMAC check inside the controller instead.
router.post("/webhook", paystackWebhook);

module.exports = router;
