import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { GiFruitBowl } from "react-icons/gi";
import { usePantry } from "../context/PantryContext.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const CATEGORIES = [
  "protein",
  "vegetable",
  "fruit",
  "dairy",
  "grain",
  "spice",
  "other",
];

const Pantry = () => {
  const {
    items,
    loading,
    loaded,
    fetchPantry,
    addItem,
    updateItem,
    deleteItem,
    clearPantry,
  } = usePantry();
  const [form, setForm] = useState({
    name: "",
    quantity: "1",
    category: "other",
  });
  const [adding, setAdding] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    quantity: "",
    category: "other",
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loaded) fetchPantry();
  }, [loaded, fetchPantry]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setAdding(true);
    const ok = await addItem({
      name: form.name.trim(),
      quantity: form.quantity.trim() || "1",
      category: form.category,
    });
    if (ok) setForm({ name: "", quantity: "1", category: "other" });
    setAdding(false);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
    });
  };

  const saveEdit = async () => {
    await updateItem(editingId, editForm);
    setEditingId(null);
  };

  const filteredItems =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const inCat = filteredItems.filter((i) => i.category === cat);
    if (inCat.length) acc[cat] = inCat;
    return acc;
  }, {});

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            <GiFruitBowl className="me-2" style={{ color: "var(--accent)" }} />
            My Pantry
          </h2>
          <p style={{ color: "var(--text-secondary)" }} className="mb-0">
            {items.length} ingredient{items.length !== 1 ? "s" : ""} available
          </p>
        </div>
        {items.length > 0 && (
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => setShowClearModal(true)}
          >
            <FiTrash2 className="me-1" /> Clear All
          </button>
        )}
      </div>

      {/* Add form */}
      <div className="glass-card p-4 mb-4">
        <h6 className="fw-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Add Ingredient
        </h6>
        <form onSubmit={handleAdd} className="row g-2">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="e.g., chicken, tomato, rice"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Quantity (e.g., 500g)"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button
              type="submit"
              className="btn btn-accent w-100"
              disabled={adding || !form.name.trim()}
            >
              {adding ? (
                <LoadingSpinner size={18} />
              ) : (
                <>
                  <FiPlus className="me-1" /> Add
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      {items.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            className={`btn btn-sm ${filter === "all" ? "btn-accent" : "btn-outline-secondary"}`}
            onClick={() => setFilter("all")}
          >
            All ({items.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            if (!count) return null;
            return (
              <button
                key={cat}
                className={`btn btn-sm ${filter === cat ? "btn-accent" : "btn-outline-secondary"}`}
                onClick={() => setFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {loading && !loaded ? (
        <LoadingSpinner fullScreen />
      ) : items.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <GiFruitBowl
            size={56}
            style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}
          />
          <h5 style={{ color: "var(--text-primary)" }}>Your pantry is empty</h5>
          <p style={{ color: "var(--text-secondary)" }}>
            Add your first ingredient above to get started.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="mb-4">
            <h6
              className="text-uppercase mb-2"
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.75rem",
                letterSpacing: "1px",
              }}
            >
              {cat}
            </h6>
            <div className="row g-2">
              {catItems.map((item) => (
                <div key={item._id} className="col-md-6 col-lg-4">
                  <div className="glass-card p-3 d-flex justify-content-between align-items-center">
                    {editingId === item._id ? (
                      <div className="d-flex flex-grow-1 gap-2">
                        <input
                          className="form-control form-control-sm"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                        <input
                          className="form-control form-control-sm"
                          value={editForm.quantity}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              quantity: e.target.value,
                            })
                          }
                          style={{ maxWidth: 80 }}
                        />
                        <button
                          className="btn btn-sm btn-accent"
                          onClick={saveEdit}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditingId(null)}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div
                            style={{
                              color: "var(--text-primary)",
                              textTransform: "capitalize",
                              fontWeight: 500,
                            }}
                          >
                            {item.name}
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.quantity}
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => startEdit(item)}
                            aria-label="Edit"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteItem(item._id)}
                            aria-label="Delete"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <ConfirmModal
        show={showClearModal}
        title="Clear entire pantry?"
        message="This will remove all ingredients from your pantry. This action cannot be undone."
        confirmLabel="Clear All"
        onConfirm={async () => {
          await clearPantry();
          setShowClearModal(false);
        }}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
};

export default Pantry;