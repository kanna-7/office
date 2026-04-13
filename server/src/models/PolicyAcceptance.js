import mongoose from "mongoose";

const policyAcceptanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true, index: true },
    acceptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to ensure unique acceptance per user per policy
policyAcceptanceSchema.index({ userId: 1, policyId: 1 }, { unique: true });

export const PolicyAcceptance = mongoose.model("PolicyAcceptance", policyAcceptanceSchema);