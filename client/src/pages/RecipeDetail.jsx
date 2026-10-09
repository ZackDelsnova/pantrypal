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