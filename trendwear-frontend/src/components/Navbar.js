import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black px-3">
      <div className="container">
        <Link className="navbar-brand text-warning fw-bold" to="/">TrendWear GH</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item"><Link className="nav-link" to="/shop">Shop</Link></li>
            <li className="nav-item">
              <Link className="nav-link" to="/cart">
                Cart{count > 0 && <span className="badge bg-warning text-dark ms-1">{count}</span>}
              </Link>
            </li>
            <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>
            {isAdmin && (
              <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>
            )}
            {isAuthenticated ? (
              <>
                <li className="nav-item"><span className="nav-link text-warning">Hi, {user?.name}</span></li>
                <li className="nav-item">
                  <button className="btn btn-outline-warning btn-sm ms-lg-2" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
