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