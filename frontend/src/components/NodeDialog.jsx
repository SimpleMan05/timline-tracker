import Modal from "./Modal.jsx";

export default function NodeDialog({ node, timelineName, onClose, onEdit, onDelete }) {
  const dateStr = new Date(node.date).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Modal onClose={onClose}>
      <span
        className="node-dialog__badge"
        style={{ background: `${node.color}22`, color: node.color, border: `1px solid ${node.color}55` }}
      >
        {timelineName}
      </span>
      <h3 style={{ marginTop: 0 }}>{node.label}</h3>
      <div className="node-dialog__meta">
        {dateStr}
        {node.time ? ` · ${node.time}` : ""}
        {node.important ? " · ★ important" : ""}
      </div>
      {node.message && <p className="node-dialog__message">{node.message}</p>}
      <div className="modal__actions">
        <button className="icon-btn icon-btn--danger" onClick={onDelete} title="Delete">
          ✕
        </button>
        <button className="btn-ghost" onClick={onEdit}>
          Edit
        </button>
        <button className="btn-solid" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
