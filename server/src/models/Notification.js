import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    readAt: { type: Date },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
