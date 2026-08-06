const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getTimelines: () => request("/timelines"),
  createTimeline: (name) =>
    request("/timelines", { method: "POST", body: JSON.stringify({ name }) }),
  renameTimeline: (id, name) =>
    request(`/timelines/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
  deleteTimeline: (id) => request(`/timelines/${id}`, { method: "DELETE" }),
  addNode: (timelineId, node) =>
    request(`/timelines/${timelineId}/nodes`, { method: "POST", body: JSON.stringify(node) }),
  updateNode: (timelineId, nodeId, node) =>
    request(`/timelines/${timelineId}/nodes/${nodeId}`, {
      method: "PATCH",
      body: JSON.stringify(node),
    }),
  deleteNode: (timelineId, nodeId) =>
    request(`/timelines/${timelineId}/nodes/${nodeId}`, { method: "DELETE" }),
};
