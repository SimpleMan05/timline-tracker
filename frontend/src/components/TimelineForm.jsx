import { useState } from "react";
import Modal from "./Modal.jsx";

export default function TimelineForm({ initialName = "", onSubmit, onClose, title }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError("Give the timeline a name.");
    setSaving(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3>{title}</h3>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Timeline name</label>
          <input
            type="text"
            autoFocus
            placeholder="e.g. Google SWE"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {error && <div className="error-text">{error}</div>}
        <div className="modal__actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-solid" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
