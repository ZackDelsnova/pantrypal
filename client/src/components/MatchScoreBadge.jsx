/**
 * Circular progress ring showing recipe match score (0–100).
 * Props:
 *   score (number)
 *   size (number, default 64)
 */
const MatchScoreBadge = ({ score = 0, size = 64 }) => {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  // Color based on score
  let color = "var(--text-secondary)";
  if (safeScore >= 100) color = "var(--accent)";
  else if (safeScore >= 70) color = "var(--warning)";
  else if (safeScore >= 40) color = "#e67e22";

  const label =
    safeScore >= 100
      ? "Can Cook!"
      : safeScore >= 70
        ? "Almost"
        : safeScore >= 40
          ? "Partial"
          : "Low";

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.25rem",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border-glass)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size < 56 ? "0.75rem" : "0.9rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {Math.round(safeScore)}%
        </div>
      </div>
      {size >= 56 && (
        <span
          style={{
            fontSize: "0.7rem",
            color,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default MatchScoreBadge;