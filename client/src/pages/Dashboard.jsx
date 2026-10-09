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