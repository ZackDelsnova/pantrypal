import { FiX } from "react-icons/fi";

/**
 * Small pill-style tag for an ingredient name.
 * Props:
 *   name (string)      — the ingredient text
 *   onRemove (fn)      — optional; if provided, shows an X button
 *   variant (string)   — 'default' | 'matched' | 'missing' (controls color)
 */
const IngredientTag = ({ name, onRemove, variant = "default" }) => {
  const colorMap = {
    default: {
      bg: "var(--bg-glass)",
      color: "var(--text-primary)",
      border: "var(--border-glass)",
    },
    matched: {
      bg: "rgba(46, 204, 113, 0.18)",
      color: "var(--accent)",
      border: "rgba(46, 204, 113, 0.4)",
    },
    missing: {
      bg: "rgba(231, 76, 60, 0.15)",
      color: "var(--danger)",
      border: "rgba(231, 76, 60, 0.35)",
    },
  };
  const c = colorMap[variant] || colorMap.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.25rem 0.7rem",
        borderRadius: "999px",
        fontSize: "0.85rem",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        textTransform: "capitalize",
        fontWeight: 500,
      }}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            padding: 0,
            lineHeight: 1,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <FiX size={13} />
        </button>
      )}
    </span>
  );
};

export default IngredientTag;