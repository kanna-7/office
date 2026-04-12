import { Attendance } from "../models/Attendance.js";
import { MonthlySalaryRecord } from "../models/MonthlySalaryRecord.js";
import { User } from "../models/User.js";
import { getOrCreateSettings } from "../models/SystemSettings.js";
import { computeLeaveExtraDays } from "./leaveBalanceService.js";
import { dateKeyInTimeZone } from "./dateService.js";

function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

export async function buildMonthlySalaryForUser(userId, year, month) {
  const settings = await getOrCreateSettings();
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const base = user.baseSalary || 0;

  const tz = settings.companyTimeZone;
  const pad = (n) => String(n).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  const startKey = `${year}-${pad(month)}-01`;
  const endKey = `${year}-${pad(month)}-${pad(lastDay)}`;

  const attendances = await Attendance.find({
    userId,
    dateKey: { $gte: startKey, $lte: endKey },
  }).lean();

  let lateTotal = 0;
  for (const a of attendances) {
    if (a.isLate && settings.latePenaltyEnabled) {
      lateTotal += Number(a.latePenaltyAmount) || 0;
    }
  }

  const { extra: extraLeaveDays } = await computeLeaveExtraDays(userId, year, month);
  const leaveDeduction = extraLeaveDays * (settings.extraLeaveDeductionPerDay || 0);

  const deductions = [];
  if (lateTotal > 0) {
    deductions.push({
      code: "LATE",
      label: "Late login penalty",
      amount: roundMoney(lateTotal),
    });
  }
  if (leaveDeduction > 0) {
    deductions.push({
      code: "LEAVE_EXTRA",
      label: `Extra leave (${extraLeaveDays} day(s) beyond allowance)`,
      amount: roundMoney(leaveDeduction),
    });
  }

  const totalDeductions = roundMoney(deductions.reduce((s, d) => s + d.amount, 0));
  const netSalary = roundMoney(Math.max(0, base - totalDeductions));

  return {
    userId,
    year,
    month,
    baseSalary: base,
    deductions,
    totalDeductions,
    netSalary,
    meta: { prorationDays: settings.salaryProrationDays, extraLeaveDays },
  };
}

export async function upsertMonthlyRecordsForAllUsers(year, month, { finalize = false } = {}) {
  const users = await User.find({ role: "employee", isActive: true });
  const results = [];
  for (const u of users) {
    const payload = await buildMonthlySalaryForUser(u._id, year, month);
    const rec = await MonthlySalaryRecord.findOneAndUpdate(
      { userId: u._id, year, month },
      {
        ...payload,
        finalized: finalize ? true : false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    results.push(rec);
  }
  return results;
}

export async function attendanceSummaryForMonth(userId, year, month) {
  const settings = await getOrCreateSettings();
  const tz = settings.companyTimeZone;
  const pad = (n) => String(n).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  const startKey = `${year}-${pad(month)}-01`;
  const endKey = `${year}-${pad(month)}-${pad(lastDay)}`;

  const rows = await Attendance.find({
    userId,
    dateKey: { $gte: startKey, $lte: endKey },
  }).lean();

  return rows.map((r) => ({
    dateKey: r.dateKey || dateKeyInTimeZone(r.checkInAt, tz),
    checkInAt: r.checkInAt,
    checkOutAt: r.checkOutAt,
    isLate: r.isLate,
    latePenaltyAmount: r.latePenaltyAmount,
  }));
}
