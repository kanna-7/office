import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    /** YYYY-MM-DD in company TZ */
    dateKey: { type: String, required: true, index: true },
    checkInAt: { type: Date },
    checkOutAt: { type: Date },
    checkInLatitude: { type: Number },
    checkInLongitude: { type: Number },
    checkOutLatitude: { type: Number },
    checkOutLongitude: { type: Number },
    isLate: { type: Boolean, default: false },
    /** Snapshot of rule outcome for payroll audit */
    latePenaltyAmount: { type: Number, default: 0, min: 0 },
    geoBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
