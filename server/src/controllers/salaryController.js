import { MonthlySalaryRecord } from "../models/MonthlySalaryRecord.js";
import {
  buildMonthlySalaryForUser,
  upsertMonthlyRecordsForAllUsers,
  attendanceSummaryForMonth,
} from "../services/salaryService.js";
import { computeLeaveExtraDays } from "../services/leaveBalanceService.js";

export async function mySalaryPreview(req, res) {
  const now = new Date();
  const year = Number(req.query.year) || now.getUTCFullYear();
  const month = Number(req.query.month) || now.getUTCMonth() + 1;
  const payload = await buildMonthlySalaryForUser(req.user._id, year, month);
  const leave = await computeLeaveExtraDays(req.user._id, year, month);
  const attendance = await attendanceSummaryForMonth(req.user._id, year, month);
  return res.json({ preview: payload, leave, attendance });
}

export async function myRecords(req, res) {
  const rows = await MonthlySalaryRecord.find({ userId: req.user._id }).sort({ year: -1, month: -1 });
  return res.json(rows);
}

export async function adminListRecords(req, res) {
  const { year, month } = req.query;
  const q = {};
  if (year) q.year = Number(year);
  if (month) q.month = Number(month);
  const rows = await MonthlySalaryRecord.find(q)
    .sort({ year: -1, month: -1 })
    .populate("userId", "name email");
  return res.json(rows);
}

export async function adminGeneratePayroll(req, res) {
  const { year, month, finalize } = req.body;
  if (!year || !month) {
    return res.status(400).json({ message: "year and month required" });
  }
  const results = await upsertMonthlyRecordsForAllUsers(Number(year), Number(month), {
    finalize: Boolean(finalize),
  });
  return res.json({ count: results.length, records: results });
}

export async function adminPreviewEmployee(req, res) {
  const { userId, year, month } = req.query;
  if (!userId || !year || !month) {
    return res.status(400).json({ message: "userId, year, month required" });
  }
  const payload = await buildMonthlySalaryForUser(userId, Number(year), Number(month));
  return res.json(payload);
}
