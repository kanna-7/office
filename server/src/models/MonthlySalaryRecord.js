import mongoose from "mongoose";

const deductionLineSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const monthlySalaryRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    baseSalary: { type: Number, required: true, min: 0 },
    deductions: { type: [deductionLineSchema], default: [] },
    totalDeductions: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    finalized: { type: Boolean, default: false },
  },
  { timestamps: true }
);

monthlySalaryRecordSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export const MonthlySalaryRecord = mongoose.model("MonthlySalaryRecord", monthlySalaryRecordSchema);
