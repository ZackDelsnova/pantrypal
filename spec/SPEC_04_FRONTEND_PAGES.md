# SPEC_04_FRONTEND_PAGES.md — React Pages & Helper Components

> **INPUT:** This file + SPEC_00_OVERVIEW.md + SPEC_03 (already applied)
> **PREREQUISITE:** SPEC_03 fully generated, client boots cleanly
> **OUTPUT:** 3 helper components + 13 page components (all already stubbed as empty)
> **ORDER:** Generate components first, then pages. Commit after each section.

---

## INSTRUCTION

Read SPEC_00_OVERVIEW.md and this file. Then generate every component below.

Rules:

- ES modules, React 18 functional components, hooks only.
- Use CSS variables from SPEC_00 (e.g., `var(--accent)`, `var(--bg-glass)`, `var(--text-primary)`).
- Use Bootstrap utility classes (`container`, `row`, `col-md-6`, `btn`, `form-control`, `d-flex`, `gap-2`, etc.).
- Use custom classes `glass-card` and `btn-accent` (defined in SPEC_05).
- Use `react-icons` for all icons.
- Use `react-toastify`'s `toast` for feedback.
- Use `useAuth()` from `../context/AuthContext.jsx`.
- Use `usePantry()` from `../context/PantryContext.jsx`.
- Use `useTheme()` from `../context/ThemeContext.jsx`.
- Use `api` from `../api/axios.js` for all HTTP calls.
- Use `useNavigate`, `useParams`, `Link` from `react-router-dom`.
- All API base URL is `http://localhost:5000/api` (already in axios.js).
- Every page must return a top-level `<div className="container py-4">` (except Landing which is full-width).
- NO inline hex colors — always use CSS variables.
- Handle loading states with `<LoadingSpinner />` from `../components/LoadingSpinner.jsx`.

Do NOT redefine contexts, routes, or Navbar. Do NOT touch App.jsx.

---

## PART A — Helper Components

### 1. client/src/components/IngredientTag.jsx

```jsx
import { FiX } from "react-icons/fi";

/**
 * Small pill-style tag for an ingredient name.
 * Props:
 *   name (string)      — the ingredient text
 *   onRemove (fn)      — optional; if provided, shows an X button
 *   variant (string)   — 'default' | 'matched' | 'missing' (controls color)
 */
const IngredientTag = ({ name, onRemove, variant = "default" }) => {
  const colorMap = {
    default: {
      bg: "var(--bg-glass)",
      color: "var(--text-primary)",
      border: "var(--border-glass)",
    },
    matched: {
      bg: "rgba(46, 204, 113, 0.18)",
      color: "var(--accent)",
      border: "rgba(46, 204, 113, 0.4)",
    },
    missing: {
      bg: "rgba(231, 76, 60, 0.15)",
      color: "var(--danger)",
      border: "rgba(231, 76, 60, 0.35)",
    },
  };
  const c = colorMap[variant] || colorMap.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.25rem 0.7rem",
        borderRadius: "999px",
        fontSize: "0.85rem",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        textTransform: "capitalize",
        fontWeight: 500,
      }}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            padding: 0,
            lineHeight: 1,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <FiX size={13} />
        </button>
      )}
    </span>
  );
};

export default IngredientTag;
```

---

### 2. client/src/components/MatchScoreBadge.jsx

```jsx
/**
 * Circular progress ring showing recipe match score (0–100).
 * Props:
 *   score (number)
 *   size (number, default 64)
 */
const MatchScoreBadge = ({ score = 0, size = 64 }) => {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  // Color based on score
  let color = "var(--text-secondary)";
  if (safeScore >= 100) color = "var(--accent)";
  else if (safeScore >= 70) color = "var(--warning)";
  else if (safeScore >= 40) color = "#e67e22";

  const label =
    safeScore >= 100
      ? "Can Cook!"
      : safeScore >= 70
        ? "Almost"
        : safeScore >= 40
          ? "Partial"
          : "Low";

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.25rem",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border-glass)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size < 56 ? "0.75rem" : "0.9rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {Math.round(safeScore)}%
        </div>
      </div>
      {size >= 56 && (
        <span
          style={{
            fontSize: "0.7rem",
            color,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default MatchScoreBadge;
```

---

### 3. client/src/components/RecipeCard.jsx

```jsx
import { Link } from "react-router-dom";
import { FiHeart, FiClock } from "react-icons/fi";
import MatchScoreBadge from "./MatchScoreBadge.jsx";
import IngredientTag from "./IngredientTag.jsx";

/**
 * Recipe card used on Discover, SmartMatch, Favorites pages.
 * Props:
 *   recipe (object)       — Mongoose recipe doc
 *   matchData (object)    — optional { matchScore, missingIngredients, matchedIngredients }
 *   isFavorite (bool)
 *   onFavoriteToggle (fn)
 *   showMatch (bool)      — whether to show MatchScoreBadge
 */
const RecipeCard = ({
  recipe,
  matchData = null,
  isFavorite = false,
  onFavoriteToggle,
  showMatch = false,
}) => {
  if (!recipe) return null;

  return (
    <div
      className="glass-card h-100 d-flex flex-column"
      style={{ overflow: "hidden", padding: 0 }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={
            recipe.imageUrl ||
            "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt={recipe.title}
          style={{
            width: "100%",
            height: "180px",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/400x300?text=No+Image";
          }}
        />
        {showMatch && matchData && (
          <div
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              background: "var(--bg-glass)",
              borderRadius: "50%",
              padding: "0.35rem",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--border-glass)",
            }}
          >
            <MatchScoreBadge score={matchData.matchScore} size={54} />
          </div>
        )}
        {onFavoriteToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle(recipe._id);
            }}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            style={{
              position: "absolute",
              top: "0.6rem",
              left: "0.6rem",
              background: "var(--bg-glass)",
              border: "1px solid var(--border-glass)",
              borderRadius: "50%",
              width: 34,
              height: 34,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              color: isFavorite ? "var(--danger)" : "var(--text-primary)",
            }}
          >
            <FiHeart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <h6
            className="mb-0 fw-bold"
            style={{ color: "var(--text-primary)", lineHeight: 1.3 }}
          >
            {recipe.title}
          </h6>
        </div>

        <div
          className="d-flex flex-wrap gap-2 mb-2"
          style={{ fontSize: "0.75rem" }}
        >
          {recipe.cuisine && (
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>
              {recipe.cuisine}
            </span>
          )}
          {recipe.category && (
            <span style={{ color: "var(--text-secondary)" }}>
              · {recipe.category}
            </span>
          )}
        </div>

        {showMatch && matchData?.missingIngredients?.length > 0 && (
          <div className="mb-2">
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                marginBottom: "0.3rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Missing ({matchData.missingIngredients.length})
            </div>
            <div className="d-flex flex-wrap gap-1">
              {matchData.missingIngredients.slice(0, 3).map((ing) => (
                <IngredientTag key={ing} name={ing} variant="missing" />
              ))}
              {matchData.missingIngredients.length > 3 && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    alignSelf: "center",
                  }}
                >
                  +{matchData.missingIngredients.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {showMatch && matchData?.missingIngredients?.length === 0 && (
          <div
            style={{
              padding: "0.35rem 0.6rem",
              background: "rgba(46, 204, 113, 0.15)",
              border: "1px solid rgba(46, 204, 113, 0.35)",
              borderRadius: "8px",
              fontSize: "0.75rem",
              color: "var(--accent)",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            ✓ You have everything!
          </div>
        )}

        <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <FiClock size={12} /> {recipe.ingredients?.length || 0} ingredients
          </span>
          <Link to={`/recipes/${recipe._id}`} className="btn btn-sm btn-accent">
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
```

---

## PART B — Pages

### 4. client/src/pages/NotFound.jsx

```jsx
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
```

---

### 5. client/src/pages/Landing.jsx

Full-width hero + feature cards + CTA.

```jsx
import { Link } from "react-router-dom";
import { GiCookingPot, GiFruitBowl, GiKnifeFork } from "react-icons/gi";
import {
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiTrendingUp,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <GiFruitBowl size={32} />,
      title: "Smart Pantry",
      text: "Add ingredients you already have. Track quantities and expiry dates.",
    },
    {
      icon: <FiSearch size={32} />,
      title: "Match Algorithm",
      text: "We rank recipes by how many ingredients you already own — no more guessing.",
    },
    {
      icon: <FiHeart size={32} />,
      title: "Save Favorites",
      text: "Bookmark recipes you love and build your personal cookbook.",
    },
    {
      icon: <FiShoppingCart size={32} />,
      title: "Shopping Lists",
      text: "Pick recipes to cook. We generate a grouped list of only what you're missing.",
    },
  ];

  return (
    <div>
      {/* HERO */}
      <section
        className="d-flex align-items-center"
        style={{
          minHeight: "75vh",
          background:
            "radial-gradient(circle at 30% 30%, rgba(46,204,113,0.12), transparent 60%), radial-gradient(circle at 70% 70%, rgba(46,204,113,0.08), transparent 55%)",
        }}
      >
        <div className="container text-center py-5">
          <div
            className="d-inline-flex align-items-center gap-2 mb-3 px-3 py-2 glass-card"
            style={{ borderRadius: "999px", fontSize: "0.85rem" }}
          >
            <FiTrendingUp style={{ color: "var(--accent)" }} />
            <span style={{ color: "var(--text-secondary)" }}>
              100+ recipes from TheMealDB
            </span>
          </div>

          <h1
            className="fw-bold mb-3"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              color: "var(--text-primary)",
              lineHeight: 1.15,
            }}
          >
            Cook with what you{" "}
            <span style={{ color: "var(--accent)" }}>already have</span>.
          </h1>

          <p
            className="mx-auto mb-4"
            style={{
              maxWidth: 640,
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
            }}
          >
            PantryPal matches your fridge and pantry against hundreds of recipes
            — and shows you exactly what you can cook right now, ranked by
            ingredient match.
          </p>

          <div className="d-flex flex-wrap gap-3 justify-content-center">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-accent btn-lg px-4">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-accent btn-lg px-4">
                  Get Started — Free
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline-secondary btn-lg px-4"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          <div
            className="mt-5 d-flex justify-content-center gap-2 flex-wrap"
            style={{ opacity: 0.85 }}
          >
            <GiKnifeFork size={22} style={{ color: "var(--accent)" }} />
            <GiCookingPot size={22} style={{ color: "var(--accent)" }} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-5">
        <h2
          className="text-center fw-bold mb-5"
          style={{ color: "var(--text-primary)" }}
        >
          How PantryPal works
        </h2>
        <div className="row g-4">
          {features.map((f, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <div className="glass-card h-100 p-4 text-center">
                <div
                  className="mb-3 d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(46, 204, 113, 0.15)",
                    color: "var(--accent)",
                  }}
                >
                  {f.icon}
                </div>
                <h6
                  className="fw-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {f.title}
                </h6>
                <p
                  className="mb-0"
                  style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
                >
                  {f.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-5">
        <div className="glass-card p-5 text-center">
          <h3 className="fw-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Ready to stop wasting food?
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              maxWidth: 560,
              margin: "0 auto 1.5rem",
            }}
          >
            Enter what you have. Discover what you can make.
          </p>
          <Link
            to={isAuthenticated ? "/smart-match" : "/register"}
            className="btn btn-accent btn-lg px-4"
          >
            {isAuthenticated ? "Find Recipes Now" : "Create Free Account"}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
```

---

### 6. client/src/pages/Login.jsx

```jsx
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
```

---

### 7. client/src/pages/Register.jsx

```jsx
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
```

---

### 8. client/src/pages/Dashboard.jsx

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GiFruitBowl, GiForkKnifeSpoon } from "react-icons/gi";
import { FiHeart, FiShoppingCart, FiTrendingUp, FiPlus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { usePantry } from "../context/PantryContext.jsx";
import api from "../api/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const { items: pantryItems, loaded: pantryLoaded, fetchPantry } = usePantry();
  const [stats, setStats] = useState({ favorites: 0, recipes: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!pantryLoaded) fetchPantry();
    const loadStats = async () => {
      try {
        const [favRes, recipeRes] = await Promise.all([
          api.get("/favorites"),
          api.get("/recipes?limit=1"),
        ]);
        setStats({
          favorites: favRes.data.length,
          recipes: recipeRes.data.total || 0,
        });
      } catch {
        /* silent */
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [pantryLoaded, fetchPantry]);

  const pantryCount = pantryItems.length;

  const cards = [
    {
      label: "Pantry Items",
      value: pantryCount,
      icon: <GiFruitBowl size={26} />,
      to: "/pantry",
      color: "var(--accent)",
    },
    {
      label: "Favorites",
      value: stats.favorites,
      icon: <FiHeart size={26} />,
      to: "/favorites",
      color: "#e74c3c",
    },
    {
      label: "Recipes Available",
      value: stats.recipes,
      icon: <GiForkKnifeSpoon size={26} />,
      to: "/discover",
      color: "#f39c12",
    },
  ];

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Hi, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p style={{ color: "var(--text-secondary)" }} className="mb-0">
          Here's what's cooking in your kitchen today.
        </p>
      </div>

      {loadingStats ? (
        <LoadingSpinner fullScreen />
      ) : (
        <>
          <div className="row g-3 mb-4">
            {cards.map((c, i) => (
              <div key={i} className="col-md-4">
                <Link to={c.to} className="text-decoration-none">
                  <div className="glass-card p-4 h-100">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {c.label}
                        </div>
                        <div
                          style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            lineHeight: 1.2,
                          }}
                        >
                          {c.value}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(46, 204, 113, 0.12)",
                          color: c.color,
                        }}
                      >
                        {c.icon}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
              <div className="glass-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5
                    className="mb-0 fw-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <FiTrendingUp
                      className="me-2"
                      style={{ color: "var(--accent)" }}
                    />
                    Quick Actions
                  </h5>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Link
                      to="/smart-match"
                      className="btn btn-accent w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                    >
                      <GiForkKnifeSpoon /> What Can I Cook?
                    </Link>
                  </div>
                  <div className="col-md-6">
                    <Link
                      to="/pantry"
                      className="btn btn-outline-secondary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                    >
                      <FiPlus /> Manage Pantry
                    </Link>
                  </div>
                  <div className="col-md-6">
                    <Link
                      to="/discover"
                      className="btn btn-outline-secondary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                    >
                      <FiTrendingUp /> Discover Recipes
                    </Link>
                  </div>
                  <div className="col-md-6">
                    <Link
                      to="/shopping-list"
                      className="btn btn-outline-secondary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                    >
                      <FiShoppingCart /> Shopping List
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="glass-card p-4 h-100">
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Recent Pantry Additions
                </h6>
                {pantryCount === 0 ? (
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    No items yet. Add some ingredients to get started.
                  </p>
                ) : (
                  <ul className="list-unstyled mb-0">
                    {pantryItems.slice(0, 6).map((item) => (
                      <li
                        key={item._id}
                        className="d-flex justify-content-between align-items-center py-2"
                        style={{
                          borderBottom: "1px solid var(--border-glass)",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--text-primary)",
                            textTransform: "capitalize",
                          }}
                        >
                          {item.name}
                        </span>
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                          }}
                        >
                          {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
```

---

### 9. client/src/pages/Pantry.jsx

```jsx
import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiAlertTriangle } from "react-icons/fi";
import { GiFruitBowl } from "react-icons/gi";
import { usePantry } from "../context/PantryContext.jsx";
import IngredientTag from "../components/IngredientTag.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const CATEGORIES = [
  "protein",
  "vegetable",
  "fruit",
  "dairy",
  "grain",
  "spice",
  "other",
];

const Pantry = () => {
  const {
    items,
    loading,
    loaded,
    fetchPantry,
    addItem,
    updateItem,
    deleteItem,
    clearPantry,
  } = usePantry();
  const [form, setForm] = useState({
    name: "",
    quantity: "1",
    category: "other",
  });
  const [adding, setAdding] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    quantity: "",
    category: "other",
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loaded) fetchPantry();
  }, [loaded, fetchPantry]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setAdding(true);
    const ok = await addItem({
      name: form.name.trim(),
      quantity: form.quantity.trim() || "1",
      category: form.category,
    });
    if (ok) setForm({ name: "", quantity: "1", category: "other" });
    setAdding(false);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
    });
  };

  const saveEdit = async () => {
    await updateItem(editingId, editForm);
    setEditingId(null);
  };

  const filteredItems =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const inCat = filteredItems.filter((i) => i.category === cat);
    if (inCat.length) acc[cat] = inCat;
    return acc;
  }, {});

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            <GiFruitBowl className="me-2" style={{ color: "var(--accent)" }} />
            My Pantry
          </h2>
          <p style={{ color: "var(--text-secondary)" }} className="mb-0">
            {items.length} ingredient{items.length !== 1 ? "s" : ""} available
          </p>
        </div>
        {items.length > 0 && (
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => setShowClearModal(true)}
          >
            <FiTrash2 className="me-1" /> Clear All
          </button>
        )}
      </div>

      {/* Add form */}
      <div className="glass-card p-4 mb-4">
        <h6 className="fw-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Add Ingredient
        </h6>
        <form onSubmit={handleAdd} className="row g-2">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="e.g., chicken, tomato, rice"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Quantity (e.g., 500g)"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button
              type="submit"
              className="btn btn-accent w-100"
              disabled={adding || !form.name.trim()}
            >
              {adding ? (
                <LoadingSpinner size={18} />
              ) : (
                <>
                  <FiPlus className="me-1" /> Add
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      {items.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            className={`btn btn-sm ${filter === "all" ? "btn-accent" : "btn-outline-secondary"}`}
            onClick={() => setFilter("all")}
          >
            All ({items.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            if (!count) return null;
            return (
              <button
                key={cat}
                className={`btn btn-sm ${filter === cat ? "btn-accent" : "btn-outline-secondary"}`}
                onClick={() => setFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {loading && !loaded ? (
        <LoadingSpinner fullScreen />
      ) : items.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <GiFruitBowl
            size={56}
            style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}
          />
          <h5 style={{ color: "var(--text-primary)" }}>Your pantry is empty</h5>
          <p style={{ color: "var(--text-secondary)" }}>
            Add your first ingredient above to get started.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="mb-4">
            <h6
              className="text-uppercase mb-2"
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.75rem",
                letterSpacing: "1px",
              }}
            >
              {cat}
            </h6>
            <div className="row g-2">
              {catItems.map((item) => (
                <div key={item._id} className="col-md-6 col-lg-4">
                  <div className="glass-card p-3 d-flex justify-content-between align-items-center">
                    {editingId === item._id ? (
                      <div className="d-flex flex-grow-1 gap-2">
                        <input
                          className="form-control form-control-sm"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                        <input
                          className="form-control form-control-sm"
                          value={editForm.quantity}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              quantity: e.target.value,
                            })
                          }
                          style={{ maxWidth: 80 }}
                        />
                        <button
                          className="btn btn-sm btn-accent"
                          onClick={saveEdit}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditingId(null)}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div
                            style={{
                              color: "var(--text-primary)",
                              textTransform: "capitalize",
                              fontWeight: 500,
                            }}
                          >
                            {item.name}
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.quantity}
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => startEdit(item)}
                            aria-label="Edit"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteItem(item._id)}
                            aria-label="Delete"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <ConfirmModal
        show={showClearModal}
        title="Clear entire pantry?"
        message="This will remove all ingredients from your pantry. This action cannot be undone."
        confirmLabel="Clear All"
        onConfirm={async () => {
          await clearPantry();
          setShowClearModal(false);
        }}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
};

export default Pantry;
```

---

### 10. client/src/pages/Discover.jsx

```jsx
import { useEffect, useState } from "react";
import { FiSearch, FiFilter } from "react-icons/fi";
import api from "../api/axios.js";
import RecipeCard from "../components/RecipeCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";

const Discover = () => {
  const { isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get("/favorites");
      setFavoriteIds(new Set(data.map((f) => f.recipeId?._id).filter(Boolean)));
    } catch {
      /* silent */
    }
  };

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (cuisine) params.set("cuisine", cuisine);
      if (category) params.set("category", category);
      params.set("page", page);
      params.set("limit", 12);
      const { data } = await api.get(`/recipes?${params.toString()}`);
      setRecipes(data.recipes);
      setPages(data.pages);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);
  useEffect(() => {
    fetchRecipes();
  }, [search, cuisine, category, page]);

  const handleFavoriteToggle = async (recipeId) => {
    if (!isAuthenticated) {
      toast.info("Login to save favorites");
      return;
    }
    if (favoriteIds.has(recipeId)) {
      try {
        const { data } = await api.get("/favorites");
        const fav = data.find((f) => f.recipeId?._id === recipeId);
        if (fav) {
          await api.delete(`/favorites/${fav._id}`);
          setFavoriteIds((s) => {
            const n = new Set(s);
            n.delete(recipeId);
            return n;
          });
          toast.success("Removed from favorites");
        }
      } catch {
        toast.error("Failed to remove");
      }
    } else {
      try {
        await api.post("/favorites", { recipeId });
        setFavoriteIds((s) => new Set(s).add(recipeId));
        toast.success("Added to favorites");
      } catch {
        toast.error("Failed to add");
      }
    }
  };

  // Collect unique cuisines + categories from loaded recipes for filter dropdowns
  const [cuisines, setCuisines] = useState([]);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const { data } = await api.get("/recipes?limit=1000");
        const c = [
          ...new Set(data.recipes.map((r) => r.cuisine).filter(Boolean)),
        ].sort();
        const k = [
          ...new Set(data.recipes.map((r) => r.category).filter(Boolean)),
        ].sort();
        setCuisines(c);
        setCategories(k);
      } catch {
        /* silent */
      }
    };
    loadFilters();
  }, []);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Discover Recipes
        </h2>
        <p style={{ color: "var(--text-secondary)" }} className="mb-0">
          {total} recipes available
        </p>
      </div>

      <div className="glass-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span
                className="input-group-text"
                style={{
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-secondary)",
                }}
              >
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={cuisine}
              onChange={(e) => {
                setCuisine(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Cuisines</option>
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-1">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearch("");
                setCuisine("");
                setCategory("");
                setPage(1);
              }}
              title="Clear filters"
            >
              <FiFilter size={14} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : recipes.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <h5 style={{ color: "var(--text-primary)" }}>No recipes found</h5>
          <p style={{ color: "var(--text-secondary)" }}>
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {recipes.map((r) => (
              <div key={r._id} className="col-sm-6 col-lg-4">
                <RecipeCard
                  recipe={r}
                  isFavorite={favoriteIds.has(r._id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span style={{ color: "var(--text-secondary)" }}>
                Page {page} of {pages}
              </span>
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Discover;
```

---

### 11. client/src/pages/SmartMatch.jsx

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GiCookingPot } from "react-icons/gi";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import { usePantry } from "../context/PantryContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const SmartMatch = () => {
  const { items, loaded, fetchPantry } = usePantry();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    if (!loaded) fetchPantry();
  }, [loaded, fetchPantry]);

  const loadFavorites = async () => {
    try {
      const { data } = await api.get("/favorites");
      setFavoriteIds(new Set(data.map((f) => f.recipeId?._id).filter(Boolean)));
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const runMatch = async () => {
    if (items.length === 0) {
      toast.info("Add ingredients to your pantry first");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/recipes/match");
      setMatches(data.recipes || []);
      setHasRun(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Match failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loaded && items.length > 0 && !hasRun) runMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const handleFavoriteToggle = async (recipeId) => {
    if (favoriteIds.has(recipeId)) {
      try {
        const { data } = await api.get("/favorites");
        const fav = data.find((f) => f.recipeId?._id === recipeId);
        if (fav) {
          await api.delete(`/favorites/${fav._id}`);
          setFavoriteIds((s) => {
            const n = new Set(s);
            n.delete(recipeId);
            return n;
          });
          toast.success("Removed from favorites");
        }
      } catch {
        toast.error("Failed");
      }
    } else {
      try {
        await api.post("/favorites", { recipeId });
        setFavoriteIds((s) => new Set(s).add(recipeId));
        toast.success("Added to favorites");
      } catch {
        toast.error("Failed");
      }
    }
  };

  const perfect = matches.filter((m) => m.matchScore >= 100);
  const almost = matches.filter(
    (m) => m.matchScore >= 70 && m.matchScore < 100,
  );
  const partial = matches.filter((m) => m.matchScore < 70);

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <GiCookingPot
          size={64}
          style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}
        />
        <h3 style={{ color: "var(--text-primary)" }}>Your pantry is empty</h3>
        <p style={{ color: "var(--text-secondary)" }}>
          Add some ingredients to see what you can cook.
        </p>
        <Link to="/pantry" className="btn btn-accent mt-2">
          <FiPlus className="me-1" /> Add Ingredients
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            <GiCookingPot className="me-2" style={{ color: "var(--accent)" }} />
            What Can I Cook?
          </h2>
          <p style={{ color: "var(--text-secondary)" }} className="mb-0">
            Based on {items.length} ingredient{items.length !== 1 ? "s" : ""} in
            your pantry
          </p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={runMatch}
          disabled={loading}
        >
          <FiRefreshCw className="me-1" /> Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : matches.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <h5 style={{ color: "var(--text-primary)" }}>
            No matching recipes found
          </h5>
          <p style={{ color: "var(--text-secondary)" }}>
            Try adding more common ingredients to your pantry.
          </p>
        </div>
      ) : (
        <>
          {perfect.length > 0 && (
            <section className="mb-5">
              <h5 className="fw-bold mb-3" style={{ color: "var(--accent)" }}>
                ✓ Can Cook Right Now ({perfect.length})
              </h5>
              <div className="row g-3">
                {perfect.map((r) => (
                  <div key={r._id} className="col-sm-6 col-lg-4">
                    <RecipeCard
                      recipe={r}
                      matchData={r}
                      showMatch
                      isFavorite={favoriteIds.has(r._id)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {almost.length > 0 && (
            <section className="mb-5">
              <h5 className="fw-bold mb-3" style={{ color: "var(--warning)" }}>
                Almost There ({almost.length})
              </h5>
              <div className="row g-3">
                {almost.map((r) => (
                  <div key={r._id} className="col-sm-6 col-lg-4">
                    <RecipeCard
                      recipe={r}
                      matchData={r}
                      showMatch
                      isFavorite={favoriteIds.has(r._id)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {partial.length > 0 && (
            <section className="mb-5">
              <h5
                className="fw-bold mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                Partial Match ({partial.length})
              </h5>
              <div className="row g-3">
                {partial.map((r) => (
                  <div key={r._id} className="col-sm-6 col-lg-4">
                    <RecipeCard
                      recipe={r}
                      matchData={r}
                      showMatch
                      isFavorite={favoriteIds.has(r._id)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default SmartMatch;
```

---

### 12. client/src/pages/RecipeDetail.jsx

```jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiHeart,
  FiExternalLink,
  FiShoppingCart,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import IngredientTag from "../components/IngredientTag.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usePantry } from "../context/PantryContext.jsx";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items } = usePantry();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favId, setFavId] = useState(null);

  const pantrySet = new Set(items.map((i) => i.name.toLowerCase()));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/recipes/${id}`);
        setRecipe(data);
        if (isAuthenticated) {
          const { data: favs } = await api.get("/favorites");
          const fav = favs.find((f) => f.recipeId?._id === id);
          if (fav) {
            setIsFavorite(true);
            setFavId(fav._id);
          }
        }
      } catch {
        toast.error("Recipe not found");
        navigate("/discover");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAuthenticated, navigate]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info("Login to save favorites");
      return;
    }
    try {
      if (isFavorite && favId) {
        await api.delete(`/favorites/${favId}`);
        setIsFavorite(false);
        setFavId(null);
        toast.success("Removed from favorites");
      } else {
        const { data } = await api.post("/favorites", { recipeId: id });
        setIsFavorite(true);
        setFavId(data._id);
        toast.success("Added to favorites");
      }
    } catch {
      toast.error("Failed");
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!recipe) return null;

  const steps = recipe.instructions
    ? Array.isArray(recipe.instructions)
      ? recipe.instructions
      : recipe.instructions.split(/\r?\n+/).filter((s) => s.trim())
    : [];

  return (
    <div className="container py-4">
      <button
        className="btn btn-outline-secondary btn-sm mb-3"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft className="me-1" /> Back
      </button>

      <div className="row g-4">
        <div className="col-lg-5">
          <div
            className="glass-card"
            style={{ overflow: "hidden", padding: 0 }}
          >
            <img
              src={
                recipe.imageUrl ||
                "https://via.placeholder.com/600x400?text=No+Image"
              }
              alt={recipe.title}
              style={{ width: "100%", display: "block" }}
            />
          </div>

          <div className="glass-card p-4 mt-3">
            <h6
              className="fw-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Actions
            </h6>
            <div className="d-grid gap-2">
              <button
                className={`btn ${isFavorite ? "btn-danger" : "btn-outline-danger"}`}
                onClick={toggleFavorite}
              >
                <FiHeart
                  className="me-2"
                  fill={isFavorite ? "currentColor" : "none"}
                />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>
              {recipe.youtubeUrl && (
                <a
                  href={recipe.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-secondary"
                >
                  <FiExternalLink className="me-2" /> Watch Video
                </a>
              )}
              <Link to="/shopping-list" className="btn btn-outline-secondary">
                <FiShoppingCart className="me-2" /> Generate Shopping List
              </Link>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="glass-card p-4">
            <h2
              className="fw-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {recipe.title}
            </h2>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {recipe.cuisine && (
                <span
                  className="badge"
                  style={{
                    background: "rgba(46, 204, 113, 0.15)",
                    color: "var(--accent)",
                  }}
                >
                  {recipe.cuisine}
                </span>
              )}
              {recipe.category && (
                <span
                  className="badge"
                  style={{
                    background: "var(--bg-glass)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {recipe.category}
                </span>
              )}
            </div>

            {recipe.description && (
              <p style={{ color: "var(--text-secondary)" }}>
                {recipe.description}
              </p>
            )}

            <hr style={{ borderColor: "var(--border-glass)" }} />

            <h5
              className="fw-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Ingredients ({recipe.ingredients?.length || 0})
            </h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {recipe.ingredients?.map((ing) => (
                <IngredientTag
                  key={ing}
                  name={ing}
                  variant={
                    pantrySet.has(ing.toLowerCase()) ? "matched" : "default"
                  }
                />
              ))}
            </div>

            {steps.length > 0 && (
              <>
                <h5
                  className="fw-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Instructions
                </h5>
                <ol
                  style={{
                    color: "var(--text-secondary)",
                    paddingLeft: "1.2rem",
                  }}
                >
                  {steps.map((step, i) => (
                    <li
                      key={i}
                      style={{ marginBottom: "0.75rem", lineHeight: 1.6 }}
                    >
                      {step}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
```

---

### 13. client/src/pages/Favorites.jsx

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import RecipeCard from "../components/RecipeCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/favorites");
      setFavorites(data);
    } catch {
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (recipeId) => {
    const fav = favorites.find((f) => f.recipeId?._id === recipeId);
    if (!fav) return;
    try {
      await api.delete(`/favorites/${fav._id}`);
      setFavorites((prev) => prev.filter((f) => f._id !== fav._id));
      toast.success("Removed from favorites");
    } catch {
      toast.error("Failed");
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
          <FiHeart className="me-2" style={{ color: "var(--danger)" }} />
          My Favorites
        </h2>
        <p style={{ color: "var(--text-secondary)" }} className="mb-0">
          {favorites.length} saved recipe{favorites.length !== 1 ? "s" : ""}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <FiHeart
            size={56}
            style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}
          />
          <h5 style={{ color: "var(--text-primary)" }}>No favorites yet</h5>
          <p style={{ color: "var(--text-secondary)" }}>
            Browse recipes and tap the heart to save them.
          </p>
          <Link to="/discover" className="btn btn-accent mt-2">
            Discover Recipes
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {favorites.map((f) => (
            <div key={f._id} className="col-sm-6 col-lg-4">
              <RecipeCard
                recipe={f.recipeId}
                isFavorite
                onFavoriteToggle={handleRemove}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
```

---

### 14. client/src/pages/ShoppingList.jsx

```jsx
import { useEffect, useState } from "react";
import { FiShoppingCart, FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const ShoppingList = () => {
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/recipes?limit=200");
        setRecipes(data.recipes || []);
      } catch {
        toast.error("Failed to load recipes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const generate = async () => {
    if (selected.length === 0) {
      toast.info("Select at least one recipe");
      return;
    }
    setGenerating(true);
    try {
      const { data } = await api.post("/shopping/generate", {
        recipeIds: selected,
      });
      setList(data);
      setChecked({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const reset = () => {
    setList(null);
    setSelected([]);
    setChecked({});
  };

  const toggleCheck = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
          <FiShoppingCart className="me-2" style={{ color: "var(--accent)" }} />
          Shopping List Generator
        </h2>
        <p style={{ color: "var(--text-secondary)" }} className="mb-0">
          Pick recipes you want to cook. We'll list only what you're missing.
        </p>
      </div>

      {!list ? (
        <>
          <div className="glass-card p-3 mb-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span style={{ color: "var(--text-secondary)" }}>
              {selected.length} recipe{selected.length !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <button
              className="btn btn-accent btn-sm"
              onClick={generate}
              disabled={generating || selected.length === 0}
            >
              {generating ? (
                <LoadingSpinner size={18} />
              ) : (
                <>
                  <FiPlus className="me-1" /> Generate List
                </>
              )}
            </button>
          </div>

          <div className="row g-2">
            {recipes.map((r) => {
              const isSelected = selected.includes(r._id);
              return (
                <div key={r._id} className="col-md-6 col-lg-4">
                  <button
                    type="button"
                    onClick={() => toggleSelect(r._id)}
                    className="glass-card p-3 w-100 text-start d-flex align-items-center gap-3"
                    style={{
                      border: isSelected
                        ? "1px solid var(--accent)"
                        : "1px solid var(--border-glass)",
                      cursor: "pointer",
                      background: isSelected
                        ? "rgba(46, 204, 113, 0.08)"
                        : "var(--bg-glass)",
                    }}
                  >
                    <img
                      src={
                        r.imageUrl || "https://via.placeholder.com/60?text=?"
                      }
                      alt=""
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.title}
                      </div>
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {r.ingredients?.length || 0} ingredients
                      </div>
                    </div>
                    {isSelected && (
                      <FiCheck size={20} style={{ color: "var(--accent)" }} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <div>
              <h5 className="mb-0" style={{ color: "var(--text-primary)" }}>
                Your Shopping List
              </h5>
              <small style={{ color: "var(--text-secondary)" }}>
                {list.missingCount} items to buy · {list.haveCount} already in
                pantry
              </small>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={reset}
            >
              <FiTrash2 className="me-1" /> Start Over
            </button>
          </div>

          {list.missingCount === 0 ? (
            <div className="glass-card p-5 text-center">
              <FiCheck
                size={56}
                style={{ color: "var(--accent)", marginBottom: "1rem" }}
              />
              <h5 style={{ color: "var(--text-primary)" }}>
                You have everything!
              </h5>
              <p style={{ color: "var(--text-secondary)" }}>
                No shopping needed for these recipes.
              </p>
            </div>
          ) : (
            <div className="row g-3">
              {Object.entries(list.missingByCategory).map(([cat, items]) => (
                <div key={cat} className="col-md-6">
                  <div className="glass-card p-4 h-100">
                    <h6
                      className="fw-bold mb-3"
                      style={{ color: "var(--accent)" }}
                    >
                      {cat}
                    </h6>
                    <ul className="list-unstyled mb-0">
                      {items.map((item) => {
                        const key = `${cat}-${item.name}`;
                        return (
                          <li
                            key={key}
                            className="d-flex align-items-center gap-2 py-2"
                            style={{
                              borderBottom: "1px solid var(--border-glass)",
                              cursor: "pointer",
                            }}
                            onClick={() => toggleCheck(key)}
                          >
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                border: "2px solid var(--border-glass)",
                                background: checked[key]
                                  ? "var(--accent)"
                                  : "transparent",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#0f1720",
                                flexShrink: 0,
                              }}
                            >
                              {checked[key] && <FiCheck size={11} />}
                            </span>
                            <span
                              style={{
                                color: "var(--text-primary)",
                                textTransform: "capitalize",
                                textDecoration: checked[key]
                                  ? "line-through"
                                  : "none",
                                opacity: checked[key] ? 0.5 : 1,
                              }}
                            >
                              {item.name}
                            </span>
                            {item.neededInRecipes > 1 && (
                              <span
                                className="ms-auto"
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ×{item.neededInRecipes}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="glass-card p-3 mt-3">
            <small style={{ color: "var(--text-secondary)" }}>
              Recipes included:{" "}
              {list.recipesIncluded.map((r) => r.title).join(", ")}
            </small>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingList;
```

---

### 15. client/src/pages/AdminPanel.jsx

```jsx
import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  cuisine: "",
  category: "",
  ingredients: "",
  instructions: "",
  youtubeUrl: "",
};

const AdminPanel = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page);
      params.set("limit", 12);
      const { data } = await api.get(`/recipes?${params}`);
      setRecipes(data.recipes);
      setPages(data.pages);
    } catch {
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, page]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (recipe) => {
    setEditingId(recipe._id);
    setForm({
      title: recipe.title || "",
      description: recipe.description || "",
      imageUrl: recipe.imageUrl || "",
      cuisine: recipe.cuisine || "",
      category: recipe.category || "",
      ingredients: (recipe.ingredients || []).join(", "),
      instructions: Array.isArray(recipe.instructions)
        ? recipe.instructions.join("\n")
        : recipe.instructions || "",
      youtubeUrl: recipe.youtubeUrl || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title required");
      return;
    }
    const ingredients = form.ingredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
    if (ingredients.length === 0) {
      toast.error("Add at least one ingredient");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      cuisine: form.cuisine.trim(),
      category: form.category.trim(),
      ingredients,
      instructions: form.instructions
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
      youtubeUrl: form.youtubeUrl.trim(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/recipes/${editingId}`, payload);
        toast.success("Recipe updated");
      } else {
        await api.post("/recipes", payload);
        toast.success("Recipe created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/recipes/${deleteId}`);
      toast.success("Recipe deleted");
      setDeleteId(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Admin Panel
          </h2>
          <p style={{ color: "var(--text-secondary)" }} className="mb-0">
            Manage recipe database
          </p>
        </div>
        <button className="btn btn-accent" onClick={openCreate}>
          <FiPlus className="me-1" /> Add Recipe
        </button>
      </div>

      <div className="glass-card p-3 mb-3">
        <div className="input-group">
          <span
            className="input-group-text"
            style={{
              background: "var(--bg-glass)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-secondary)",
            }}
          >
            <FiSearch />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : recipes.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <h5 style={{ color: "var(--text-primary)" }}>No recipes found</h5>
        </div>
      ) : (
        <>
          <div className="glass-card" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table
                className="table table-borderless mb-0"
                style={{ color: "var(--text-primary)" }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-glass)" }}>
                    <th
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Recipe
                    </th>
                    <th
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                      className="d-none d-md-table-cell"
                    >
                      Cuisine
                    </th>
                    <th
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                      className="d-none d-lg-table-cell"
                    >
                      Ingredients
                    </th>
                    <th
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                      className="text-end"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.map((r) => (
                    <tr
                      key={r._id}
                      style={{ borderBottom: "1px solid var(--border-glass)" }}
                    >
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={r.imageUrl || "https://via.placeholder.com/40"}
                            alt=""
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              objectFit: "cover",
                            }}
                          />
                          <span style={{ color: "var(--text-primary)" }}>
                            {r.title}
                          </span>
                        </div>
                      </td>
                      <td
                        className="d-none d-md-table-cell"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {r.cuisine || "—"}
                      </td>
                      <td
                        className="d-none d-lg-table-cell"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {r.ingredients?.length || 0}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary me-1"
                          onClick={() => openEdit(r)}
                          aria-label="Edit"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteId(r._id)}
                          aria-label="Delete"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pages > 1 && (
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span
                style={{ color: "var(--text-secondary)", alignSelf: "center" }}
              >
                Page {page} of {pages}
              </span>
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1050 }}
            onClick={() => setShowModal(false)}
          />
          <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div
                className="modal-content glass-card"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <div
                  className="modal-header"
                  style={{ borderBottom: "1px solid var(--border-glass)" }}
                >
                  <h5
                    className="modal-title"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {editingId ? "Edit Recipe" : "Add New Recipe"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Title *
                        </label>
                        <input
                          className="form-control"
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Cuisine
                        </label>
                        <input
                          className="form-control"
                          value={form.cuisine}
                          onChange={(e) =>
                            setForm({ ...form, cuisine: e.target.value })
                          }
                          placeholder="e.g., Italian"
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Category
                        </label>
                        <input
                          className="form-control"
                          value={form.category}
                          onChange={(e) =>
                            setForm({ ...form, category: e.target.value })
                          }
                          placeholder="e.g., Dessert"
                        />
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Image URL
                        </label>
                        <input
                          className="form-control"
                          value={form.imageUrl}
                          onChange={(e) =>
                            setForm({ ...form, imageUrl: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          YouTube URL
                        </label>
                        <input
                          className="form-control"
                          value={form.youtubeUrl}
                          onChange={(e) =>
                            setForm({ ...form, youtubeUrl: e.target.value })
                          }
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Description
                        </label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Ingredients * <small>(comma-separated)</small>
                        </label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={form.ingredients}
                          onChange={(e) =>
                            setForm({ ...form, ingredients: e.target.value })
                          }
                          placeholder="chicken, rice, onion, garlic"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Instructions <small>(one step per line)</small>
                        </label>
                        <textarea
                          className="form-control"
                          rows="5"
                          value={form.instructions}
                          onChange={(e) =>
                            setForm({ ...form, instructions: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="modal-footer"
                    style={{ borderTop: "1px solid var(--border-glass)" }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-accent"
                      disabled={saving}
                    >
                      {saving ? (
                        <LoadingSpinner size={18} />
                      ) : editingId ? (
                        "Save Changes"
                      ) : (
                        "Create Recipe"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        show={!!deleteId}
        title="Delete recipe?"
        message="This recipe will be removed permanently. Recipes that have been favorited by users may leave empty references."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminPanel;
```

---

### 16. client/src/pages/Profile.jsx

```jsx
import { useState } from "react";
import { FiUser, FiLock, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import IngredientTag from "../components/IngredientTag.jsx";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    dietaryPreference: user?.dietaryPreference || "any",
    allergies: user?.allergies || [],
  });
  const [newAllergy, setNewAllergy] = useState("");
  const [passwords, setPasswords] = useState({ newPass: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      updateUser(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const addAllergy = () => {
    const a = newAllergy.trim().toLowerCase();
    if (!a || form.allergies.includes(a)) return;
    setForm({ ...form, allergies: [...form.allergies, a] });
    setNewAllergy("");
  };

  const removeAllergy = (name) => {
    setForm({ ...form, allergies: form.allergies.filter((a) => a !== name) });
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!passwords.newPass || passwords.newPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/auth/profile", { password: passwords.newPass });
      setPasswords({ newPass: "", confirm: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
          <FiUser className="me-2" style={{ color: "var(--accent)" }} />
          My Profile
        </h2>
        <p style={{ color: "var(--text-secondary)" }} className="mb-0">
          {user?.email}
        </p>
      </div>

      <div className="glass-card p-4 mb-3">
        <h6 className="fw-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Account Details
        </h6>
        <form onSubmit={saveProfile}>
          <div className="row g-3">
            <div className="col-md-6">
              <label
                className="form-label"
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Name
              </label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
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
            <div className="col-12">
              <label
                className="form-label"
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Allergies
              </label>
              <div className="d-flex gap-2 mb-2">
                <input
                  className="form-control"
                  placeholder="e.g., peanuts"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAllergy();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={addAllergy}
                >
                  Add
                </button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {form.allergies.map((a) => (
                  <IngredientTag
                    key={a}
                    name={a}
                    onRemove={() => removeAllergy(a)}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-accent mt-3"
            disabled={savingProfile}
          >
            {savingProfile ? (
              <LoadingSpinner size={18} />
            ) : (
              <>
                <FiCheck className="me-1" /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>

      <div className="glass-card p-4">
        <h6 className="fw-bold mb-3" style={{ color: "var(--text-primary)" }}>
          <FiLock className="me-2" /> Change Password
        </h6>
        <form onSubmit={savePassword}>
          <div className="row g-3">
            <div className="col-md-6">
              <label
                className="form-label"
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                value={passwords.newPass}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPass: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <label
                className="form-label"
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Confirm
              </label>
              <input
                type="password"
                className="form-control"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-outline-secondary mt-3"
            disabled={savingPassword}
          >
            {savingPassword ? <LoadingSpinner size={18} /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
```

---

## GENERATION COMPLETE

After all files generated:

1. `cd client && npm run dev`
2. Test each route manually:
   - `/` → Landing with hero
   - `/login` → Login form + demo fill button
   - `/register` → Register with password strength
   - `/pantry` → Add items, see grouped list
   - `/smart-match` → Should call match API and group results
   - `/discover` → Grid of recipe cards
   - `/favorites` → Empty state initially
   - `/shopping-list` → Select recipes → generate
   - `/admin` → (login as <admin@pantrypal.com> first)
   - `/profile` → Edit profile
3. Commit: `feat(client): all pages and helper components`

NOTE: Landing/Login/Register will render fine without backend. Protected pages will error until backend + seed are running. That's expected — verify UI, then move to SPEC_05 (design polish) and SPEC_06 (seed).

END OF SPEC_04
