import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const { items, total, removeItem, loading } = useCart();

  return (
    <div className="container py-5">
      <h2 className="text-center text-warning mb-4">Your Cart</h2>
      {loading ? (
        <p className="text-center text-light">Loading cart...</p>
      ) : items.length > 0 ? (
        <>
          <div className="table-responsive">
            <table className="table table-dark table-bordered">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price (GH₵)</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>{item.price}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price * item.quantity}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeItem(item.productId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-end">
            <h4>Total: GH₵ {total}</h4>
            <Link to="/checkout" className="btn btn-warning">Proceed to Checkout</Link>
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="text-light">Your cart is empty.</p>
          <Link to="/shop" className="btn btn-warning">Browse the Shop</Link>
        </div>
      )}
    </div>
  );
}

export default Cart;
