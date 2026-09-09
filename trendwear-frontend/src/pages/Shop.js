import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../api/axios";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    const timeout = setTimeout(() => {
      api
        .get("/products", { params })
        .then(({ data }) => setProducts(data.products))
        .catch((err) => setError(apiErrorMessage(err, "Could not load products")))
        .finally(() => setLoading(false));
    }, 300); // debounce search typing

    return () => clearTimeout(timeout);
  }, [search, category]);

  return (
    <div className="container py-5">
      <h2 className="text-center text-warning mb-4">Shop All Products</h2>

      <div className="row mb-4 g-2">
        <div className="col-md-8">
          <input
            type="search"
            className="form-control"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <Alert onClose={() => setError("")}>{error}</Alert>

      {loading ? (
        <Spinner />
      ) : (
        <div className="row">
          {products.length > 0 ? (
            products.map((product) => <ProductCard key={product._id} product={product} />)
          ) : (
            <p className="text-center text-light">No products available yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Shop;
