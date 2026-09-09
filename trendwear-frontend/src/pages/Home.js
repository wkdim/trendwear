import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products", { params: { limit: 3 } })
      .then(({ data }) => setFeatured(data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="text-center p-5 bg-dark text-light">
        <h1 className="display-4 text-warning">TrendWear GH</h1>
        <p className="lead">Stay Trendy. Stay Gold.</p>
        <Link to="/shop" className="btn btn-warning btn-lg">Shop Now</Link>
      </header>

      <section className="container py-5">
        <h2 className="text-center mb-4 text-warning">Featured Products</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="row">
            {featured.length > 0 ? (
              featured.map((product) => <ProductCard key={product._id} product={product} />)
            ) : (
              <p className="text-center text-light">Check back soon for new arrivals.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
