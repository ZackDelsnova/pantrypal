const LoadingSpinner = ({ fullScreen = false, size = 48 }) => {
  const spinner = (
    <div
      className="spinner-border"
      role="status"
      style={{
        width: size,
        height: size,
        color: "var(--accent)",
        borderWidth: "4px",
      }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {spinner}
      </div>
    );
  }
  return spinner;
};

export default LoadingSpinner;