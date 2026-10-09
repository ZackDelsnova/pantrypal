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