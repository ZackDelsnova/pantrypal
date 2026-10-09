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