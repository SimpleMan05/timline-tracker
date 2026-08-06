import { useEffect, useState, useCallback } from "react";
import Sidebar from "./components/Sidebar.jsx";
import TimelineGraph from "./components/TimelineGraph.jsx";
import TimelineForm from "./components/TimelineForm.jsx";
import NodeForm from "./components/NodeForm.jsx";
import { api } from "./api.js";

export default function App() {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [renamingTimeline, setRenamingTimeline] = useState(null);
  const [addingNodeTo, setAddingNodeTo] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getTimelines();
      setTimelines(data);
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleDeleteTimeline(t) {
    if (!window.confirm(`Delete "${t.name}" and all its dates?`)) return;
    await api.deleteTimeline(t._id);
    refresh();
  }

  if (loading) {
    return (
      <div className="app" style={{ gridTemplateColumns: "1fr" }}>
        <div className="graph__empty">
          <h2>Loading…</h2>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="app" style={{ gridTemplateColumns: "1fr" }}>
        <div className="graph__empty">
          <h2>Couldn't reach the server</h2>
          <p>{loadError}</p>
          <p>Check that the backend is running and VITE_API_URL is correct.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <button className="menu-toggle" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle menu">
        ☰
      </button>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        isOpen={sidebarOpen}
        onRequestClose={() => setSidebarOpen(false)}
        timelines={timelines}
        onAddTimeline={() => {
          setShowAddTimeline(true);
          setSidebarOpen(false);
        }}
        onAddNode={(t) => {
          setAddingNodeTo(t);
          setSidebarOpen(false);
        }}
        onRename={(t) => setRenamingTimeline(t)}
        onDelete={handleDeleteTimeline}
      />
      <TimelineGraph timelines={timelines} onRefresh={refresh} />

      {showAddTimeline && (
        <TimelineForm
          title="New timeline"
          onClose={() => setShowAddTimeline(false)}
          onSubmit={async (name) => {
            const timeline = await api.createTimeline(name);
            await refresh();
            setShowAddTimeline(false);
            setAddingNodeTo(timeline);
          }}
        />
      )}

      {renamingTimeline && (
        <TimelineForm
          title="Rename timeline"
          initialName={renamingTimeline.name}
          onClose={() => setRenamingTimeline(null)}
          onSubmit={async (name) => {
            await api.renameTimeline(renamingTimeline._id, name);
            refresh();
          }}
        />
      )}

      {addingNodeTo && (
        <NodeForm
          timelineName={addingNodeTo.name}
          onClose={() => setAddingNodeTo(null)}
          onSubmit={async (values) => {
            await api.addNode(addingNodeTo._id, values);
            refresh();
          }}
        />
      )}
    </div>
  );
}