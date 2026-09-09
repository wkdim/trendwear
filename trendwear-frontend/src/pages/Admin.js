import { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import ProductsManager from "../components/admin/ProductsManager";
import CategoriesManager from "../components/admin/CategoriesManager";
import OrdersManager from "../components/admin/OrdersManager";
import UsersManager from "../components/admin/UsersManager";

const TABS = [
  { key: "products", label: "Products", Component: ProductsManager },
  { key: "categories", label: "Categories", Component: CategoriesManager },
  { key: "orders", label: "Orders", Component: OrdersManager },
  { key: "users", label: "Users", Component: UsersManager },
];

function Admin() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("products");

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const ActiveComponent = TABS.find((t) => t.key === tab).Component;

  return (
    <div className="container py-5">
      <h2 className="text-center text-warning mb-4">Admin Dashboard</h2>

      <div className="row text-center mb-4 g-3">
        {stats ? (
          [
            { label: "Users", value: stats.users },
            { label: "Orders", value: stats.orders },
            { label: "Products", value: stats.products },
            { label: "Categories", value: stats.categories },
          ].map((s) => (
            <div className="col-6 col-md-3" key={s.label}>
              <div className="bg-dark text-light border border-warning rounded p-3">
                <div className="fs-3 text-warning">{s.value}</div>
                <div>{s.label}</div>
              </div>
            </div>
          ))
        ) : (
          <Spinner label="Loading dashboard..." />
        )}
      </div>

      <ul className="nav nav-tabs mb-4">
        {TABS.map((t) => (
          <li className="nav-item" key={t.key}>
            <button
              className={`nav-link ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      <ActiveComponent />
    </div>
  );
}

export default Admin;
