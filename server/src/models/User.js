import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const responsibilitySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    details: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const performancePointSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    score: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    author: { type: String, trim: true, default: "HR" },
    body: { type: String, trim: true, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    baseSalary: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    /** Role expectations / duties — maintained by Admin */
    responsibilities: { type: [responsibilitySchema], default: [] },
    /** HR written remarks visible to employee */
    hrRemarks: { type: String, default: "", trim: true },
    /** Monthly performance scores for charts (0–100) */
    performanceMonthly: { type: [performancePointSchema], default: [] },
    /** Feedback entries from leadership / HR */
    feedbacks: { type: [feedbackSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);
