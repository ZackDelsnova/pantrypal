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