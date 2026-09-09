import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h2 className="text-warning">404 - Page Not Found</h2>
      <p className="text-light">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-warning">Back to Home</Link>
    </div>
  );
}

export default NotFound;
