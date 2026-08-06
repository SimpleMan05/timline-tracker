import { useState } from "react";
import Modal from "./Modal.jsx";

function toDateInput(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export default function NodeForm({ timelineName, initial, onSubmit, onClose }) {
  const [label, setLabel] = useState(initial?.label || "");
  const [date, setDate] = useState(toDateInput(initial?.date) || "");
  const [time, setTime] = useState(initial?.time || "");
  const [message, setMessage] = useState(initial?.message || "");
  const [important, setImportant] = useState(initial?.important || false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const isEditing = !!initial;

  function resetFields() {
    setLabel("");
    setDate("");
    setTime("");
    setMessage("");
    setImportant(false);
  }

  async function save() {
    if (!label.trim() || !date) {
      setError("A title and date are required.");
      return false;
    }
    setSaving(true);
    try {
      await onSubmit({ label: label.trim(), date, time, message, important });
      setError("");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndClose(e) {
    e.preventDefault();
    if (await save()) onClose();
  }

  async function handleSaveAndAddAnother() {
    if (await save()) {
      resetFields();
      setAddedCount((c) => c + 1);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3>
        {isEditing ? "Edit date" : "Add date"} —{" "}
        <span style={{ color: "var(--text-muted)" }}>{timelineName}</span>
      </h3>

      {!isEditing && addedCount > 0 && (
        <div
          style={{
            fontSize: 12,
            color: "var(--text-dim)",
            marginTop: -10,
            marginBottom: 14,
            fontFamily: "var(--font-mono)",
          }}
        >
          {addedCount} date{addedCount !== 1 ? "s" : ""} added so far
        </div>
      )}

      <form onSubmit={handleSaveAndClose}>
        <div className="field">
          <label>Title</label>
          <input
            type="text"
            autoFocus
            placeholder="e.g. Online Assessment"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div className="field-row">
          <div className="field" style={{ flex: 1 }}>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Time (optional)</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Message (optional)</label>
          <textarea
            placeholder="Any details worth remembering…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <label className="checkbox-field">
          <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} />
          Mark as important (extra glow on the timeline)
        </label>
        {error && <div className="error-text">{error}</div>}
        <div className="modal__actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            {isEditing ? "Cancel" : "Done"}
          </button>
          {!isEditing && (
            <button type="button" className="btn-ghost" onClick={handleSaveAndAddAnother} disabled={saving}>
              {saving ? "Saving…" : "+ Add another"}
            </button>
          )}
          <button type="submit" className="btn-solid" disabled={saving}>
            {saving ? "Saving…" : isEditing ? "Save" : "Save & close"}
          </button>
        </div>
      </form>
    </Modal>
  );
}