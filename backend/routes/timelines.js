import { Router } from "express";
import Timeline from "../models/Timeline.js";

const router = Router();

// Neon palette — a random color is assigned to every new timeline
const NEON_PALETTE = [
  "#00f0ff", // cyan
  "#ff2d95", // magenta
  "#aaff00", // lime
  "#b967ff", // violet
  "#ffb800", // amber
  "#ff5f56", // coral
  "#39ff9e", // mint
  "#4d7bff", // electric blue
];

function randomColor() {
  return NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)];
}

// GET /api/timelines — all timelines, sorted, with nodes sorted by date
router.get("/", async (req, res) => {
  const timelines = await Timeline.find().sort({ createdAt: 1 }).lean();
  timelines.forEach((t) => t.nodes.sort((a, b) => new Date(a.date) - new Date(b.date)));
  res.json(timelines);
});

// POST /api/timelines — create a new timeline { name }
router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "name is required" });

  const timeline = await Timeline.create({ name: name.trim(), color: randomColor() });
  res.status(201).json(timeline);
});

// PATCH /api/timelines/:id — rename a timeline { name }
router.patch("/:id", async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "name is required" });

  const timeline = await Timeline.findByIdAndUpdate(
    req.params.id,
    { name: name.trim() },
    { new: true }
  );
  if (!timeline) return res.status(404).json({ error: "timeline not found" });
  res.json(timeline);
});

// DELETE /api/timelines/:id
router.delete("/:id", async (req, res) => {
  const timeline = await Timeline.findByIdAndDelete(req.params.id);
  if (!timeline) return res.status(404).json({ error: "timeline not found" });
  res.status(204).end();
});

// POST /api/timelines/:id/nodes — add a date node { label, date, time, message, important }
router.post("/:id/nodes", async (req, res) => {
  const { label, date, time, message, important } = req.body;
  if (!label?.trim() || !date) {
    return res.status(400).json({ error: "label and date are required" });
  }

  const timeline = await Timeline.findById(req.params.id);
  if (!timeline) return res.status(404).json({ error: "timeline not found" });

  timeline.nodes.push({
    label: label.trim(),
    date,
    time: time || "",
    message: message?.trim() || "",
    important: !!important,
  });
  await timeline.save();
  res.status(201).json(timeline);
});

// PATCH /api/timelines/:id/nodes/:nodeId — update a node
router.patch("/:id/nodes/:nodeId", async (req, res) => {
  const timeline = await Timeline.findById(req.params.id);
  if (!timeline) return res.status(404).json({ error: "timeline not found" });

  const node = timeline.nodes.id(req.params.nodeId);
  if (!node) return res.status(404).json({ error: "node not found" });

  const { label, date, time, message, important } = req.body;
  if (label !== undefined) node.label = label.trim();
  if (date !== undefined) node.date = date;
  if (time !== undefined) node.time = time;
  if (message !== undefined) node.message = message.trim();
  if (important !== undefined) node.important = !!important;

  await timeline.save();
  res.json(timeline);
});

// DELETE /api/timelines/:id/nodes/:nodeId
router.delete("/:id/nodes/:nodeId", async (req, res) => {
  const timeline = await Timeline.findById(req.params.id);
  if (!timeline) return res.status(404).json({ error: "timeline not found" });

  const node = timeline.nodes.id(req.params.nodeId);
  if (!node) return res.status(404).json({ error: "node not found" });

  node.deleteOne();
  await timeline.save();
  res.json(timeline);
});

export default router;
