import { useState } from "react";
import api, { apiErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Alert from "../components/Alert";

function Checkout() {
  const { user } = useAuth();
  const { items, total } = useCart();
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data: order } = await api.post("/orders", {});
      const { data: payment } = await api.post("/payments/initiate", {
        orderId: order._id,
        email,
      });
      // Paystack's redirect back only carries its own reference/trxref
      // params, not our orderId, so stash it to read on /checkout/callback.
      sessionStorage.setItem("lastOrderId", order._id);
      window.location.href = payment.data.authorization_url;
    } catch (err) {
      setError(apiErrorMessage(err, "Could not start checkout"));
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-warning mb-3">Checkout</h2>
        <p className="text-light">Your cart is empty. Please add something from the shop first.</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <h2 className="text-center text-warning mb-4">Checkout</h2>
      <Alert onClose={() => setError("")}>{error}</Alert>

      <div className="bg-dark text-light p-3 rounded border border-warning mb-4">
        <h5 className="text-warning">Order Summary</h5>
        <ul className="list-unstyled mb-2">
          {items.map((item) => (
            <li key={item.productId} className="d-flex justify-content-between">
              <span>{item.name} x{item.quantity}</span>
              <span>GH₵ {item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
        <hr />
        <div className="d-flex justify-content-between fw-bold">
          <span>Total</span>
          <span>GH₵ {total}</span>
        </div>
      </div>

      <form className="bg-dark text-light p-4 rounded border border-warning" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email for payment receipt</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-warning w-100" disabled={submitting}>
          {submitting ? "Redirecting to Paystack..." : "Pay with Paystack"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
