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