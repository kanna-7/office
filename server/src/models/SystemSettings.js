import mongoose from "mongoose";

/**
 * All business rules live here — edited by Admin via API/UI.
 * Single document (singleton); use key _id or findOne().
 */
const systemSettingsSchema = new mongoose.Schema(
  {
    officeLatitude: { type: Number, required: true, default: 0 },
    officeLongitude: { type: Number, required: true, default: 0 },
    officeRadiusMeters: { type: Number, required: true, default: 200 },

    /** "HH:mm" 24h in company timezone */
    workdayStartTime: { type: String, required: true, default: "09:00" },
    /** Minutes after start before marked late */
    lateGraceMinutes: { type: Number, required: true, default: 15 },
    latePenaltyEnabled: { type: Boolean, default: true },
    /**
     * half_day: deduct (baseSalary / salaryProrationDays) / 2 per late check-in day
     * fixed_amount: deduct latePenaltyFixedAmount per late day
     */
    latePenaltyMode: { type: String, enum: ["half_day", "fixed_amount"], default: "half_day" },
    latePenaltyFixedAmount: { type: Number, default: 0, min: 0 },

    /** Paid / credited leave days per calendar month (configurable policy) */
    monthlyLeaveAllowanceDays: { type: Number, default: 1, min: 0 },
    /** Currency amount deducted per calendar day of leave beyond allowance in that month */
    extraLeaveDeductionPerDay: { type: Number, default: 0, min: 0 },

    /** Used to convert base salary → per-day / half-day amounts */
    salaryProrationDays: { type: Number, default: 22, min: 1 },

    /** IANA timezone for interpreting calendar days & workday start */
    companyTimeZone: { type: String, default: "Asia/Kolkata" },
  },
  { timestamps: true }
);

export const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);

export async function getOrCreateSettings() {
  let doc = await SystemSettings.findOne();
  if (!doc) {
    doc = await SystemSettings.create({});
  }
  return doc;
}
