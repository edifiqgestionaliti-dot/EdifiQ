function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex="-1"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="close-btn" onClick={onClose}>×</button>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
export default Modal;
