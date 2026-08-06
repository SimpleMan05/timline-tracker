import mongoose from "mongoose";

const { Schema } = mongoose;

const NodeSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, trim: true, default: "" }, // "HH:MM", optional
    message: { type: String, trim: true, default: "" },
    important: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TimelineSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true }, // hex neon accent
    nodes: { type: [NodeSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Timeline", TimelineSchema);
