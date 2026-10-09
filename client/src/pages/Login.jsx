import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const res = await login(form);
    if (res.success) navigate("/dashboard");
  };

  const handleDemoFill = () => {
    setForm({ email: "demo@pantrypal.com", password: "demo123" });
  };

  return (
    <div className="container py-5" style={{ maxWidth: 460 }}>
      <div className="glass-card p-4 p-md-5">
        <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Welcome back
        </h2>
        <p style={{ color: "var(--text-secondary)" }} className="mb-4">
          Login to access your pantry and recipes.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
            >
              Email
            </label>
            <div className="input-group">
              <span
                className="input-group-text"
                style={{
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-secondary)",
                }}
              >
                <FiMail />
              </span>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label
              className="form-label"
              style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
            >
              Password
            </label>
            <div className="input-group">
              <span
                className="input-group-text"
                style={{
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-secondary)",
                }}
              >
                <FiLock />
              </span>
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-accent w-100 py-2"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size={20} /> : "Login"}
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            type="button"
            onClick={handleDemoFill}
            className="btn btn-link btn-sm"
            style={{ color: "var(--accent)" }}
          >
            Use demo credentials
          </button>
        </div>

        <hr
          style={{ borderColor: "var(--border-glass)", margin: "1.5rem 0" }}
        />

        <p
          className="text-center mb-0"
          style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "var(--accent)", fontWeight: 600 }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;