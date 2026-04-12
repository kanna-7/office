import { getOrCreateSettings, SystemSettings } from "../models/SystemSettings.js";

export async function getSettings(req, res) {
  const s = await getOrCreateSettings();
  return res.json(s);
}

/** Safe subset for employees (no office coordinates). */
export async function getPublicSettings(req, res) {
  const s = await getOrCreateSettings();
  return res.json({
    workdayStartTime: s.workdayStartTime,
    lateGraceMinutes: s.lateGraceMinutes,
    companyTimeZone: s.companyTimeZone,
    monthlyLeaveAllowanceDays: s.monthlyLeaveAllowanceDays,
  });
}

export async function updateSettings(req, res) {
  const allowed = [
    "officeLatitude",
    "officeLongitude",
    "officeRadiusMeters",
    "workdayStartTime",
    "lateGraceMinutes",
    "latePenaltyEnabled",
    "latePenaltyMode",
    "latePenaltyFixedAmount",
    "monthlyLeaveAllowanceDays",
    "extraLeaveDeductionPerDay",
    "salaryProrationDays",
    "companyTimeZone",
  ];
  const patch = {};
  for (const k of allowed) {
    if (k in req.body) patch[k] = req.body[k];
  }
  const s = await SystemSettings.findOneAndUpdate({}, { $set: patch }, { new: true, upsert: true });
  return res.json(s);
}
