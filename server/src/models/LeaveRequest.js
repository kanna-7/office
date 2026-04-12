import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    /** Inclusive working-day count computed at submission */
    totalDays: { type: Number, required: true, min: 0.5 },
    reason: { type: String, default: "" },
    /** Optional tag / note visible to Admin */
    adminTag: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    decidedAt: { type: Date },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
