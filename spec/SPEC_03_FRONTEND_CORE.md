# SPEC_03_FRONTEND_CORE.md — React Core Infrastructure

> **INPUT:** This file + SPEC_00_OVERVIEW.md
> **PREREQUISITE:** `client/` folder exists with `package.json`, `vite.config.js`, `index.html`
> **OUTPUT:** Core React infrastructure (NOT pages, NOT styling)
> **ORDER:** Generate in exact order. Commit after each numbered section.

---

## INSTRUCTION

Read SPEC_00_OVERVIEW.md and this file completely. Then generate every file below in order.

Rules:

- Use ES modules (import/export). Vite + React requires it.
- Use React 18 functional components + hooks. No class components.
- Use `.jsx` extension for all React files.
- Context API only — no Redux, no Zustand.
- Bootstrap 5 for base styling (installed via npm — imported in main.jsx).
- Use `react-router-dom` v6 syntax (`useNavigate`, `<Routes>`, `<Route>`, `Outlet`).
- Use `react-toastify` for all toast notifications.
- Use `react-icons` for all icons.
- Use `axios` for all HTTP calls via a single instance in `src/api/axios.js`.
- localStorage key for JWT: `pantrypal-token`
- localStorage key for user object: `pantrypal-user`
- localStorage key for theme: `pantrypal-theme`

Do NOT generate pages under `src/pages/` — those are SPEC_04.
Do NOT generate styling beyond what's needed for the shell (SPEC_05 handles theme).

---

## 1. client/package.json

```json
{
  "name": "pantrypal-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.7",
    "bootstrap": "^5.3.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-icons": "^5.3.0",
    "react-router-dom": "^6.26.2",
    "react-toastify": "^10.0.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.8"
  }
}
```

---

## 2. client/vite.config.js

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

The proxy means frontend can call `/api/...` and Vite forwards to backend. But axios instance will use full URL `http://localhost:5000/api` for clarity. Proxy is a fallback.

---

## 3. client/index.html

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PantryPal — Smart Recipe Finder</title>
    <style>
      /* Prevent white flash before React loads */
      html,
      body {
        background-color: #0f1720;
        color: #e8f0e8;
        margin: 0;
        padding: 0;
        min-height: 100vh;
        font-family:
          system-ui,
          -apple-system,
          "Segoe UI",
          Roboto,
          sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 4. client/src/main.jsx

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { PantryProvider } from "./context/PantryContext.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <PantryProvider>
            <App />
            <ToastContainer
              position="top-right"
              autoClose={2500}
              theme="dark"
              newestOnTop
              closeOnClick
              pauseOnHover
            />
          </PantryProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

---

## 5. client/src/api/axios.js

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pantrypal-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Global response interceptor — handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("pantrypal-token");
      localStorage.removeItem("pantrypal-user");
      // Only redirect if not already on login/register
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register" && path !== "/") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

---

## 6. client/src/context/ThemeContext.jsx

```jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("pantrypal-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pantrypal-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
```

---

## 7. client/src/context/AuthContext.jsx

```jsx
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("pantrypal-user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) localStorage.setItem("pantrypal-user", JSON.stringify(user));
    else localStorage.removeItem("pantrypal-user");
  }, [user]);

  const register = async ({ name, email, password, dietaryPreference }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        dietaryPreference,
      });
      localStorage.setItem("pantrypal-token", data.token);
      const { token, ...userObj } = data;
      setUser(userObj);
      toast.success(`Welcome, ${userObj.name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("pantrypal-token", data.token);
      const { token, ...userObj } = data;
      setUser(userObj);
      toast.success(`Welcome back, ${userObj.name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("pantrypal-token");
    localStorage.removeItem("pantrypal-user");
    setUser(null);
    toast.info("Logged out");
  };

  const updateUser = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const isAuthenticated = !!user && !!localStorage.getItem("pantrypal-token");
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateUser,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
```

---

## 8. client/src/context/PantryContext.jsx

```jsx
import { createContext, useContext, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import { useAuth } from "./AuthContext.jsx";

const PantryContext = createContext();

export const PantryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchPantry = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get("/pantry");
      setItems(data);
      setLoaded(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load pantry");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addItem = async (payload) => {
    try {
      const { data } = await api.post("/pantry", payload);
      setItems((prev) => [data, ...prev]);
      toast.success(`Added ${data.name}`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add");
      return false;
    }
  };

  const updateItem = async (id, payload) => {
    try {
      const { data } = await api.put(`/pantry/${id}`, payload);
      setItems((prev) => prev.map((i) => (i._id === id ? data : i)));
      toast.success("Updated");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
      return false;
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/pantry/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Removed");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove");
      return false;
    }
  };

  const clearPantry = async () => {
    try {
      await api.delete("/pantry/clear");
      setItems([]);
      toast.success("Pantry cleared");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear");
      return false;
    }
  };

  const resetPantry = () => {
    setItems([]);
    setLoaded(false);
  };

  return (
    <PantryContext.Provider
      value={{
        items,
        loading,
        loaded,
        fetchPantry,
        addItem,
        updateItem,
        deleteItem,
        clearPantry,
        resetPantry,
      }}
    >
      {children}
    </PantryContext.Provider>
  );
};

export const usePantry = () => {
  const ctx = useContext(PantryContext);
  if (!ctx) throw new Error("usePantry must be used within PantryProvider");
  return ctx;
};
```

---

## 9. client/src/components/LoadingSpinner.jsx

```jsx
const LoadingSpinner = ({ fullScreen = false, size = 48 }) => {
  const spinner = (
    <div
      className="spinner-border"
      role="status"
      style={{
        width: size,
        height: size,
        color: "var(--accent)",
        borderWidth: "4px",
      }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {spinner}
      </div>
    );
  }
  return spinner;
};

export default LoadingSpinner;
```

---

## 10. client/src/components/ConfirmModal.jsx

```jsx
const ConfirmModal = ({
  show,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}) => {
  if (!show) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onCancel}
        style={{ zIndex: 1050 }}
      />
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content glass-card"
            style={{ border: "1px solid var(--border-glass)" }}
          >
            <div
              className="modal-header"
              style={{ borderBottom: "1px solid var(--border-glass)" }}
            >
              <h5
                className="modal-title"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onCancel}
              />
            </div>
            <div
              className="modal-body"
              style={{ color: "var(--text-secondary)" }}
            >
              {message}
            </div>
            <div
              className="modal-footer"
              style={{ borderTop: "1px solid var(--border-glass)" }}
            >
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
```

---

## 11. client/src/components/Navbar.jsx

```jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiSun, FiMoon, FiLogOut, FiUser, FiMenu } from "react-icons/fi";
import { GiCookingPot } from "react-icons/gi";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { usePantry } from "../context/PantryContext.jsx";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { resetPantry } = usePantry();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    resetPantry();
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? "active fw-semibold" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg glass-navbar sticky-top">
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center gap-2 fw-bold"
          to={isAuthenticated ? "/dashboard" : "/"}
        >
          <GiCookingPot size={26} style={{ color: "var(--accent)" }} />
          <span style={{ color: "var(--text-primary)" }}>PantryPal</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          style={{ color: "var(--text-primary)" }}
        >
          <FiMenu size={22} />
        </button>

        <div className={`collapse navbar-collapse ${mobileOpen ? "show" : ""}`}>
          {isAuthenticated && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink
                  to="/dashboard"
                  className={navLinkClass}
                  onClick={closeMobile}
                  style={{ color: "var(--text-secondary)" }}
                >
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/pantry"
                  className={navLinkClass}
                  onClick={closeMobile}
                  style={{ color: "var(--text-secondary)" }}
                >
                  My Pantry
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/discover"
                  className={navLinkClass}
                  onClick={closeMobile}
                  style={{ color: "var(--text-secondary)" }}
                >
                  Discover
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/smart-match"
                  className={navLinkClass}
                  onClick={closeMobile}
                  style={{ color: "var(--text-secondary)" }}
                >
                  What Can I Cook?
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/favorites"
                  className={navLinkClass}
                  onClick={closeMobile}
                  style={{ color: "var(--text-secondary)" }}
                >
                  Favorites
                </NavLink>
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <NavLink
                    to="/admin"
                    className={navLinkClass}
                    onClick={closeMobile}
                    style={{ color: "var(--accent)" }}
                  >
                    Admin
                  </NavLink>
                </li>
              )}
            </ul>
          )}

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            <button
              className="btn btn-sm theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  onClick={closeMobile}
                >
                  <FiUser size={14} />
                  <span className="d-none d-md-inline">
                    {user?.name?.split(" ")[0]}
                  </span>
                </Link>
                <button
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                  onClick={handleLogout}
                >
                  <FiLogOut size={14} />
                  <span className="d-none d-md-inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={closeMobile}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm btn-accent"
                  onClick={closeMobile}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

---

## 12. client/src/components/Footer.jsx

```jsx
const Footer = () => {
  return (
    <footer
      className="mt-auto py-4 text-center"
      style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
    >
      <div className="container">
        <p className="mb-1">
          <strong style={{ color: "var(--accent)" }}>PantryPal</strong> —
          Intelligent Recipe Finder
        </p>
        <p className="mb-0">
          Web Technology Lab Project · MERN Stack · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
```

---

## 13. client/src/components/ProtectedRoute.jsx

```jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
```

---

## 14. client/src/components/AdminRoute.jsx

```jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default AdminRoute;
```

---

## 15. client/src/App.jsx

```jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Pantry from "./pages/Pantry.jsx";
import Discover from "./pages/Discover.jsx";
import SmartMatch from "./pages/SmartMatch.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";
import Favorites from "./pages/Favorites.jsx";
import ShoppingList from "./pages/ShoppingList.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

import { useAuth } from "./context/AuthContext.jsx";
import { usePantry } from "./context/PantryContext.jsx";

const App = () => {
  const { isAuthenticated } = useAuth();
  const { fetchPantry, resetPantry } = usePantry();
  const location = useLocation();

  // Fetch pantry when user logs in; clear when logged out
  useEffect(() => {
    if (isAuthenticated) fetchPantry();
    else resetPantry();
  }, [isAuthenticated, fetchPantry, resetPantry]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Landing />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register />
              )
            }
          />

          {/* Public recipe detail (viewable without auth, but smart-match requires auth) */}
          <Route path="/recipes/:id" element={<RecipeDetail />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/smart-match" element={<SmartMatch />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
```

---

## 16. client/src/index.css — BASE ONLY (theme vars come in SPEC_05)

```css
/* Base resets — full theme in SPEC_05 */
* {
  box-sizing: border-box;
}

body {
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
  background-color: var(--bg-primary, #0f1720);
  color: var(--text-primary, #e8f0e8);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  min-height: 100vh;
}

a {
  text-decoration: none;
}

.btn-accent {
  background-color: var(--accent, #2ecc71);
  border-color: var(--accent, #2ecc71);
  color: #0f1720;
  font-weight: 600;
}
.btn-accent:hover {
  background-color: var(--accent-hover, #27ae60);
  border-color: var(--accent-hover, #27ae60);
  color: #0f1720;
}

.theme-toggle-btn {
  background: var(--bg-glass, rgba(255, 255, 255, 0.06));
  border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
  color: var(--text-primary, #e8f0e8);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.theme-toggle-btn:hover {
  background: var(--bg-glass-hover, rgba(255, 255, 255, 0.1));
  color: var(--accent, #2ecc71);
}

/* Navbar base — full glass style comes in SPEC_05 */
.glass-navbar {
  background: var(--bg-glass, rgba(255, 255, 255, 0.06));
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
}

/* Placeholder pages render OK before SPEC_04 */
.page-placeholder {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #9ca89c);
  font-size: 1.1rem;
}
```

---

## 17. client/src/pages/*.jsx — TEMPORARY STUBS

Generate these 13 stub files. They will be REPLACED by SPEC_04. Each stub is identical in structure:

```jsx
const PageName = () => {
  return (
    <div className="container page-placeholder">
      <div>
        <h2>PageName</h2>
        <p>This page is under construction (SPEC_04 will implement it).</p>
      </div>
    </div>
  );
};

export default PageName;
```

Stubs needed (replace `PageName` with actual name):

- Landing.jsx → `Landing`
- Login.jsx → `Login`
- Register.jsx → `Register`
- Dashboard.jsx → `Dashboard`
- Pantry.jsx → `Pantry`
- Discover.jsx → `Discover`
- SmartMatch.jsx → `SmartMatch`
- RecipeDetail.jsx → `RecipeDetail`
- Favorites.jsx → `Favorites`
- ShoppingList.jsx → `ShoppingList`
- AdminPanel.jsx → `AdminPanel`
- Profile.jsx → `Profile`
- NotFound.jsx → `NotFound`

Also create `client/src/components/RecipeCard.jsx` and `MatchScoreBadge.jsx` and `IngredientTag.jsx` as empty stubs (just `export default () => null;`). SPEC_04 fills them.

---

## GENERATION COMPLETE

After generating all sections:

1. `cd client && npm install`
2. `npm run dev`
3. Open <http://localhost:5173> — you should see the Navbar with theme toggle (dark mode, no white flash), a placeholder page, and Footer
4. Login/Register links work (they'll show stub pages)
5. Commit: `feat(client): core infrastructure — axios, contexts, routing, layout shell`

Do NOT proceed to SPEC_04 until this boots cleanly with no console errors.

END OF SPEC_03
