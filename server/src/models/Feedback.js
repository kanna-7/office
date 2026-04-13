import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["company", "exit"], required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, default: "" },
    anonymous: { type: Boolean, default: false },
    resignationId: { type: mongoose.Schema.Types.ObjectId, ref: "Resignation" }, // for exit feedback
  },
  { timestamps: true }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);