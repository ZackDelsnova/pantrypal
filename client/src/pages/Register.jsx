import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    dietaryPreference: "any",
  });
  const [errors, setErrors] = useState({});

  const passwordStrength = (p) => {
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s; // 0-5
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const res = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      dietaryPreference: form.dietaryPreference,
    });
    if (res.success) navigate("/dashboard");
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = [
    "Too weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Excellent",
  ][strength];
  const strengthColor = [
    "var(--danger)",
    "var(--danger)",
    "var(--warning)",
    "#e67e22",
    "var(--accent)",
    "var(--accent)",
  ][strength];

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <div className="glass-card p-4 p-md-5">
        <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Create your account
        </h2>
        <p style={{ color: "var(--text-secondary)" }} className="mb-4">
          Start cooking with what you already have.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
            >
              Full Name
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
                <FiUser />
              </span>
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>
          </div>

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
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
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
                placeholder="Min 6 characters"
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>
            {form.password && (
              <div className="mt-2">
                <div
                  style={{
                    height: 4,
                    background: "var(--border-glass)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(strength / 5) * 100}%`,
                      height: "100%",
                      background: strengthColor,
                      transition: "all 0.3s",
                    }}
                  />
                </div>
                <small style={{ color: strengthColor, fontSize: "0.75rem" }}>
                  {strengthLabel}
                </small>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              className={`form-control ${errors.confirm ? "is-invalid" : ""}`}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="Repeat password"
            />
            {errors.confirm && (
              <div className="invalid-feedback">{errors.confirm}</div>
            )}
          </div>

          <div className="mb-4">
            <label
              className="form-label"
              style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
            >
              Dietary Preference
            </label>
            <select
              className="form-select"
              value={form.dietaryPreference}
              onChange={(e) =>
                setForm({ ...form, dietaryPreference: e.target.value })
              }
            >
              <option value="any">No preference</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-accent w-100 py-2"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size={20} /> : "Create Account"}
          </button>
        </form>

        <hr
          style={{ borderColor: "var(--border-glass)", margin: "1.5rem 0" }}
        />

        <p
          className="text-center mb-0"
          style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;