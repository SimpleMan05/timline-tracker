export default function Sidebar({ timelines, onAddTimeline, onAddNode, onRename, onDelete, isOpen, onRequestClose }) {
  const totalNodes = timelines.reduce((sum, t) => sum + t.nodes.length, 0);

  return (
    <aside className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
      <div className="sidebar__header">
        <button className="sidebar__close" onClick={onRequestClose} aria-label="Close menu">
          ✕
        </button>
        <p className="sidebar__title">Timeline Tracker</p>
        <h1 className="sidebar__subtitle">Timelines</h1>
        <div className="sidebar__count">
          {timelines.length} timeline{timelines.length !== 1 ? "s" : ""} · {totalNodes} date
          {totalNodes !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="sidebar__list">
        {timelines.length === 0 && (
          <div className="empty-hint">
            No timelines yet.
            <br />
            Add one for each company or process you're tracking.
          </div>
        )}

        {timelines.map((t) => (
          <div className="timeline-row" key={t._id}>
            <span className="timeline-row__dot" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
            <div className="timeline-row__info">
              <div className="timeline-row__name">{t.name}</div>
              <div className="timeline-row__meta">
                {t.nodes.length} date{t.nodes.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="timeline-row__actions">
              <button className="icon-btn" title="Add date" onClick={() => onAddNode(t)}>
                +
              </button>
              <button className="icon-btn" title="Rename" onClick={() => onRename(t)}>
                ✎
              </button>
              <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => onDelete(t)}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar__footer">
        <button className="btn-primary" onClick={onAddTimeline}>
          + New timeline
        </button>
      </div>
    </aside>
  );
}