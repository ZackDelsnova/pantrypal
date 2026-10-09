const ConfirmModal = ({
  show,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}) => {
  if (!show) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onCancel}
        style={{ zIndex: 1050 }}
      />
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content glass-card"
            style={{ border: "1px solid var(--border-glass)" }}
          >
            <div
              className="modal-header"
              style={{ borderBottom: "1px solid var(--border-glass)" }}
            >
              <h5
                className="modal-title"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onCancel}
              />
            </div>
            <div
              className="modal-body"
              style={{ color: "var(--text-secondary)" }}
            >
              {message}
            </div>
            <div
              className="modal-footer"
              style={{ borderTop: "1px solid var(--border-glass)" }}
            >
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;