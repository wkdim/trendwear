import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { apiErrorMessage } from "../api/axios";
import { useCart } from "../context/CartContext";
import Spinner from "../components/Spinner";

// Paystack redirects here (see callback_url in paymentController.initiatePayment)
// with ?reference=... once the shopper finishes paying.
function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const { clearGuestCart, refresh } = useCart();
  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const orderId = searchParams.get("orderId") || sessionStorage.getItem("lastOrderId");

    if (!reference || !orderId) {
      setStatus("failed");
      setMessage("Missing payment reference — if you completed payment, check your orders.");
      return;
    }

    api
      .post("/payments/verify", { reference, orderId })
      .then(({ data }) => {
        if (data.data?.status === "success") {
          setStatus("success");
          clearGuestCart();
          refresh();
        } else {
          setStatus("failed");
          setMessage("Payment was not successful.");
        }
      })
      .catch((err) => {
        setStatus("failed");
        setMessage(apiErrorMessage(err, "Could not verify payment"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (status === "verifying") return <Spinner label="Verifying payment..." />;

  return (
    <div className="container py-5 text-center">
      {status === "success" ? (
        <>
          <h2 className="text-warning mb-3">Payment Successful 🎉</h2>
          <p className="text-light">Thanks for your order — we're getting it ready.</p>
        </>
      ) : (
        <>
          <h2 className="text-warning mb-3">Payment Issue</h2>
          <p className="text-light">{message}</p>
        </>
      )}
      <Link to="/shop" className="btn btn-warning">Continue Shopping</Link>
    </div>
  );
}

export default PaymentCallback;
