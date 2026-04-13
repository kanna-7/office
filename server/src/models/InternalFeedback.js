import mongoose from "mongoose";

const internalFeedbackSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["team", "manager"], required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export const InternalFeedback = mongoose.model("InternalFeedback", internalFeedbackSchema);