import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../../api/axios";
import Alert from "../Alert";
import Spinner from "../Spinner";

const STATUSES = ["pending", "shipped", "delivered"];

function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/admin/orders")
      .then(({ data }) => setOrders(data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
      load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update order"));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <Alert onClose={() => setError("")}>{error}</Alert>
      <div className="table-responsive">
        <table className="table table-dark table-bordered align-middle">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.user?.name || "—"}</td>
                <td>{order.products.length}</td>
                <td>GH₵ {order.totalAmount}</td>
                <td>
                  <span className={`badge bg-${order.paymentStatus === "paid" ? "success" : "secondary"}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersManager;
