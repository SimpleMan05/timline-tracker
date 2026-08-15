import { useMemo, useRef, useLayoutEffect, useState } from "react";
import NodeDialog from "./NodeDialog.jsx";
import NodeForm from "./NodeForm.jsx";
import { api } from "../api.js";

const ROW_HEIGHT = 100;
const LANE_GAP = 170;
const LANE_START_X = 300;
const TOP_PAD = 90;
const BOTTOM_PAD = 80;

function combinedTimestamp(dateStr, timeStr) {
  const d = new Date(dateStr);
  if (timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    d.setHours(h || 0, m || 0, 0, 0);
  }
  return d.getTime();
}



export default function TimelineGraph({ timelines, onRefresh }) {
  const todayRef = useRef(null);
  const [activeNode, setActiveNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);

  const layout = useMemo(() => {
    const INACTIVE_COLOR = "#5a5a66";

    const lanes = timelines.map((t, i) => ({
      id: t._id,
      name: t.name,
      color: t.isActive === false ? INACTIVE_COLOR : t.color,
      isActive: t.isActive !== false,
      x: LANE_START_X + i * LANE_GAP,
    }));

    const entries = [];
    timelines.forEach((t) => {
      const laneColor = t.isActive === false ? INACTIVE_COLOR : t.color;
      t.nodes.forEach((n) => {
        entries.push({
          kind: "node",
          timelineId: t._id,
          timelineName: t.name,
          color: laneColor,
          ...n,
          ts: combinedTimestamp(n.date, n.time),
        });
      });
    });
    entries.push({ kind: "today", ts: Date.now(), id: "today" });
    entries.sort((a, b) => a.ts - b.ts);

    const rows = entries.map((e, i) => ({ ...e, y: TOP_PAD + i * ROW_HEIGHT }));

    const laneRanges = lanes
      .map((lane) => {
        const rowsForLane = rows.filter((r) => r.kind === "node" && r.timelineId === lane.id);
        if (rowsForLane.length === 0) return null;
        return { ...lane, y1: rowsForLane[0].y, y2: rowsForLane[rowsForLane.length - 1].y };
      })
      .filter(Boolean);

    const height = TOP_PAD + rows.length * ROW_HEIGHT + BOTTOM_PAD;
    const width = LANE_START_X + Math.max(lanes.length, 1) * LANE_GAP + 120;

    return { lanes, rows, laneRanges, height, width };
  }, [timelines]);

  useLayoutEffect(() => {
    todayRef.current?.scrollIntoView({ block: "center" });
  }, [timelines.length]);

  async function handleDeleteNode(node) {
    if (!window.confirm(`Delete "${node.label}"?`)) return;
    await api.deleteNode(node.timelineId, node._id);
    setActiveNode(null);
    onRefresh();
  }

  async function handleSaveEdit(values) {
    await api.updateNode(editingNode.timelineId, editingNode._id, values);
    setEditingNode(null);
    onRefresh();
  }

  if (timelines.length === 0) {
    return (
      <div className="graph">
        <div className="graph__empty">
          <h2>No timelines yet</h2>
          <p>Create a timeline from the sidebar to start plotting placement dates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="graph">
      <div className="graph__header" style={{ minWidth: layout.width }}>
        {layout.lanes.map((lane) => (
          <div className="lane-chip" key={lane.id} style={{ left: lane.x }}>
            <span
              className="lane-chip__dot"
              style={{ background: lane.color, boxShadow: `0 0 6px ${lane.color}` }}
            />
            <span className="lane-chip__name">{lane.name}</span>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", width: layout.width, height: layout.height }}>
        <svg width={layout.width} height={layout.height} style={{ position: "absolute", top: 0, left: 0 }}>
          <defs>
            <filter id="neonGlow" x="-75%" y="-75%" width="250%" height="250%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* separate filter for straight lines — a vertical line has zero
                bounding-box width, so the objectBoundingBox filter above would
                collapse to nothing. userSpaceOnUse fixes that. */}
            <filter
              id="neonGlowLine"
              filterUnits="userSpaceOnUse"
              x={-20}
              y={-20}
              width={layout.width + 40}
              height={layout.height + 40}
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {layout.laneRanges.map((lane) =>
            lane.y1 !== lane.y2 ? (
              <line
                key={lane.id}
                x1={lane.x}
                y1={lane.y1}
                x2={lane.x}
                y2={lane.y2}
                stroke={lane.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
                filter="url(#neonGlowLine)"
              />
            ) : null
          )}

          {layout.rows
            .filter((r) => r.kind === "today")
            .map((r) => (
              <line
                key="today-line"
                x1={0}
                y1={r.y}
                x2={layout.width}
                y2={r.y}
                stroke="#ffb800"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                opacity="0.6"
              />
            ))}

          {layout.rows
            .filter((r) => r.kind === "node")
            .map((r) => {
              const lane = layout.lanes.find((l) => l.id === r.timelineId);
              return (
                <circle
                  key={r._id}
                  className="node-dot"
                  cx={lane.x}
                  cy={r.y}
                  r={r.important ? 9 : 6}
                  fill={r.color}
                  stroke="#08080d"
                  strokeWidth="2"
                  filter="url(#neonGlow)"
                  onClick={() => setActiveNode(r)}
                />
              );
            })}
        </svg>

        {layout.rows
          .filter((r) => r.kind === "today")
          .map((r) => (
            <div key="today-tag" ref={todayRef} className="today-tag" style={{ top: r.y }}>
              TODAY
            </div>
          ))}

        {layout.rows
          .filter((r) => r.kind === "node")
          .map((r) => {
            const lane = layout.lanes.find((l) => l.id === r.timelineId);
            const dateStr = new Date(r.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            return (
              <div key={`label-${r._id}`} className="node-label" style={{ left: lane.x + 18, top: r.y }}>
                <div className="node-label__title">
                  {r.important ? "★ " : ""}
                  {r.label}
                </div>
                <div className="node-label__date">
                  {dateStr}
                  {r.time ? ` · ${r.time}` : ""}
                </div>
              </div>
            );
          })}
      </div>

      {activeNode && (
        <NodeDialog
          node={activeNode}
          timelineName={activeNode.timelineName}
          onClose={() => setActiveNode(null)}
          onEdit={() => {
            setEditingNode(activeNode);
            setActiveNode(null);
          }}
          onDelete={() => handleDeleteNode(activeNode)}
        />
      )}

      {editingNode && (
        <NodeForm
          timelineName={editingNode.timelineName}
          initial={editingNode}
          onClose={() => setEditingNode(null)}
          onSubmit={handleSaveEdit}
        />
      )}
    </div>
  );
}
