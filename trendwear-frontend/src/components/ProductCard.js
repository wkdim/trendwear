import { useState } from "react";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addItem(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="col-md-4 mb-4">
      <div className="card bg-black text-light border-warning h-100">
        <img
          src={product.image || "https://placehold.co/300x300?text=TrendWear"}
          className="card-img-top"
          alt={product.name}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text">GH₵ {product.price}</p>
          <button
            className="btn btn-warning mt-auto"
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
          >
            {product.stock === 0 ? "Out of stock" : added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
