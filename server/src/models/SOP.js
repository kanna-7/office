import mongoose from "mongoose";

const sopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ["HR", "Technical", "Operations"], required: true },
    fileName: { type: String, required: true, trim: true },
    filePath: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true, min: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const SOP = mongoose.model("SOP", sopSchema);