import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

// Wrap a <Route element> with this to require a logged-in user, e.g.
// <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}

export default ProtectedRoute;
