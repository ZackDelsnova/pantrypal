import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";

const NotFound = () => (
  <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
    <h1
      style={{
        fontSize: "6rem",
        color: "var(--accent)",
        fontWeight: 800,
        margin: 0,
      }}
    >
      404
    </h1>
    <h3 style={{ color: "var(--text-primary)" }}>Page Not Found</h3>
    <p style={{ color: "var(--text-secondary)" }}>
      The page you're looking for doesn't exist.
    </p>
    <Link to="/" className="btn btn-accent mt-3">
      <FiHome className="me-2" /> Back to Home
    </Link>
  </div>
);

export default NotFound;