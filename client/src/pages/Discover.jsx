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
  const [cuisines, setCuisines] = useState([]);
  const [categories, setCategories] = useState([]);

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