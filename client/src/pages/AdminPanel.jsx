import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  cuisine: "",
  category: "",
  ingredients: "",
  instructions: "",
  youtubeUrl: "",
};

const AdminPanel = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page);
      params.set("limit", 12);
      const { data } = await api.get(`/recipes?${params}`);
      setRecipes(data.recipes);
      setPages(data.pages);
    } catch {
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, page]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (recipe) => {
    setEditingId(recipe._id);
    setForm({
      title: recipe.title || "",
      description: recipe.description || "",
      imageUrl: recipe.imageUrl || "",
      cuisine: recipe.cuisine || "",
      category: recipe.category || "",
      ingredients: (recipe.ingredients || []).join(", "),
      instructions: Array.isArray(recipe.instructions)
        ? recipe.instructions.join("\n")
        : recipe.instructions || "",
      youtubeUrl: recipe.youtubeUrl || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title required");
      return;
    }
    const ingredients = form.ingredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
    if (ingredients.length === 0) {
      toast.error("Add at least one ingredient");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      cuisine: form.cuisine.trim(),
      category: form.category.trim(),
      ingredients,
      instructions: form.instructions
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
      youtubeUrl: form.youtubeUrl.trim(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/recipes/${editingId}`, payload);
        toast.success("Recipe updated");
      } else {
        await api.post("/recipes", payload);
        toast.success("Recipe created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/recipes/${deleteId}`);
      toast.success("Recipe deleted");
      setDeleteId(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Admin Panel
          </h2>
          <p style={{ color: "var(--text-secondary)" }} className="mb-0">
            Manage recipe database
          </p>
        </div>
        <button className="btn btn-accent" onClick={openCreate}>
          <FiPlus className="me-1" /> Add Recipe
        </button>
      </div>

      <div className="glass-card p-3 mb-3">
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
            placeholder="Search by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : recipes.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <h5 style={{ color: "var(--text-primary)" }}>No recipes found</h5>
        </div>
      ) : (
        <>
          <div className="glass-card" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table
                className="table table-borderless mb-0"
                style={{ color: "var(--text-primary)" }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-glass)" }}>
                    <th
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Recipe
                    </th>
                    <th
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                      className="d-none d-md-table-cell"
                    >
                      Cuisine
                    </th>
                    <th
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                      className="d-none d-lg-table-cell"
                    >
                      Ingredients
                    </th>
                    <th
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                      className="text-end"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.map((r) => (
                    <tr
                      key={r._id}
                      style={{ borderBottom: "1px solid var(--border-glass)" }}
                    >
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={r.imageUrl || "https://via.placeholder.com/40"}
                            alt=""
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              objectFit: "cover",
                            }}
                          />
                          <span style={{ color: "var(--text-primary)" }}>
                            {r.title}
                          </span>
                        </div>
                      </td>
                      <td
                        className="d-none d-md-table-cell"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {r.cuisine || "—"}
                      </td>
                      <td
                        className="d-none d-lg-table-cell"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {r.ingredients?.length || 0}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary me-1"
                          onClick={() => openEdit(r)}
                          aria-label="Edit"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteId(r._id)}
                          aria-label="Delete"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pages > 1 && (
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span
                style={{ color: "var(--text-secondary)", alignSelf: "center" }}
              >
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

      {/* Add/Edit Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1050 }}
            onClick={() => setShowModal(false)}
          />
          <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div
                className="modal-content glass-card"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <div
                  className="modal-header"
                  style={{ borderBottom: "1px solid var(--border-glass)" }}
                >
                  <h5
                    className="modal-title"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {editingId ? "Edit Recipe" : "Add New Recipe"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Title *
                        </label>
                        <input
                          className="form-control"
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Cuisine
                        </label>
                        <input
                          className="form-control"
                          value={form.cuisine}
                          onChange={(e) =>
                            setForm({ ...form, cuisine: e.target.value })
                          }
                          placeholder="e.g., Italian"
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Category
                        </label>
                        <input
                          className="form-control"
                          value={form.category}
                          onChange={(e) =>
                            setForm({ ...form, category: e.target.value })
                          }
                          placeholder="e.g., Dessert"
                        />
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Image URL
                        </label>
                        <input
                          className="form-control"
                          value={form.imageUrl}
                          onChange={(e) =>
                            setForm({ ...form, imageUrl: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          YouTube URL
                        </label>
                        <input
                          className="form-control"
                          value={form.youtubeUrl}
                          onChange={(e) =>
                            setForm({ ...form, youtubeUrl: e.target.value })
                          }
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Description
                        </label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Ingredients * <small>(comma-separated)</small>
                        </label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={form.ingredients}
                          onChange={(e) =>
                            setForm({ ...form, ingredients: e.target.value })
                          }
                          placeholder="chicken, rice, onion, garlic"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Instructions <small>(one step per line)</small>
                        </label>
                        <textarea
                          className="form-control"
                          rows="5"
                          value={form.instructions}
                          onChange={(e) =>
                            setForm({ ...form, instructions: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="modal-footer"
                    style={{ borderTop: "1px solid var(--border-glass)" }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-accent"
                      disabled={saving}
                    >
                      {saving ? (
                        <LoadingSpinner size={18} />
                      ) : editingId ? (
                        "Save Changes"
                      ) : (
                        "Create Recipe"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        show={!!deleteId}
        title="Delete recipe?"
        message="This recipe will be removed permanently. Recipes that have been favorited by users may leave empty references."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminPanel;