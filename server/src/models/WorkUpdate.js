import mongoose from "mongoose";

const workUpdateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    tasksCompleted: { type: String, required: true, trim: true },
    workHours: { type: Number, required: true, min: 0, max: 24 },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// Compound index to ensure unique update per user per date
workUpdateSchema.index({ userId: 1, date: 1 }, { unique: true });

export const WorkUpdate = mongoose.model("WorkUpdate", workUpdateSchema);