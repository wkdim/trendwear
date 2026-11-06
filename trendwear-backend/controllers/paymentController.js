const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/apiError");

const assertOwnsOrder = (order, req) => {
  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have access to this order");
  }
};

// Initiate Payment
exports.initiatePayment = asyncHandler(async (req, res) => {
  const { orderId, email } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  assertOwnsOrder(order, req);

  if (order.paymentStatus === "paid") {
    throw new ApiError(400, "Order has already been paid for");
  }

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email,
      amount: Math.round(order.totalAmount * 100), // kobo
      // Read back on the webhook so we know which order a payment belongs to.
      metadata: { orderId: order._id.toString() },
      // Computed server-side from a trusted env var, not the client-supplied
      // body, so a request can't redirect a shopper to an arbitrary site
      // after payment.
      callback_url: `${process.env.FRONTEND_URL}/checkout/callback`,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  res.json(response.data);
});

// Verify Payment
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { reference, orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  assertOwnsOrder(order, req);

  const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });

  if (response.data.data.status === "success") {
    order.paymentStatus = "paid";
    await order.save();
  }

  res.json(response.data);
});

// Paystack Webhook: Paystack signs every webhook request with
// HMAC-SHA512(body, PAYSTACK_SECRET_KEY) in the x-paystack-signature
// header. Without checking it, anyone who finds this URL could POST a
// fake "charge.success" event and mark any order as paid for free.
exports.paystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  // Signed over the exact raw bytes Paystack sent (captured by the
  // express.json `verify` hook in server.js); re-serializing the parsed
  // req.body could produce different bytes and false-reject legitimate events.
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.rawBody || Buffer.from(JSON.stringify(req.body)))
    .digest("hex");

  if (!signature || signature !== expected) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;
  if (event.event === "charge.success") {
    const orderId = event.data?.metadata?.orderId;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = "paid";
        await order.save();
      }
    }
  }

  res.status(200).send("Webhook received");
});
