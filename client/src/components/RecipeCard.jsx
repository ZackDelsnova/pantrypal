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