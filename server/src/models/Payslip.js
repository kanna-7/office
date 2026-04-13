import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2020 },
    basicSalary: { type: Number, required: true, min: 0 },
    hra: { type: Number, default: 0, min: 0 },
    conveyance: { type: Number, default: 0, min: 0 },
    medical: { type: Number, default: 0, min: 0 },
    lta: { type: Number, default: 0, min: 0 },
    otherAllowances: { type: Number, default: 0, min: 0 },
    deductions: [{
      name: { type: String, required: true, trim: true },
      amount: { type: Number, required: true, min: 0 }
    }],
    netSalary: { type: Number, required: true, min: 0 },
    filePath: { type: String, trim: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Compound index to ensure unique payslip per user per month/year
payslipSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export const Payslip = mongoose.model("Payslip", payslipSchema);