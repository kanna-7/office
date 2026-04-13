import mongoose from "mongoose";

const resignationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reason: { type: String, required: true, trim: true },
    lastWorkingDay: { type: Date, required: true },
    feedback: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminComment: { type: String, trim: true, default: "" },
    decidedAt: { type: Date },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Resignation = mongoose.model("Resignation", resignationSchema);