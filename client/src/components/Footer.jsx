const Footer = () => {
  return (
    <footer
      className="mt-auto py-4 text-center"
      style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
    >
      <div className="container">
        <p className="mb-1">
          <strong style={{ color: "var(--accent)" }}>PantryPal</strong> —
          Intelligent Recipe Finder
        </p>
        <p className="mb-0">
          Web Technology Lab Project · MERN Stack · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;