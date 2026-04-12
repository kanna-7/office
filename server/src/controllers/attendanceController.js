import { Attendance } from "../models/Attendance.js";
import { getOrCreateSettings } from "../models/SystemSettings.js";
import { isWithinRadius } from "../services/geoService.js";
import {
  dateKeyInTimeZone,
  minutesSinceMidnightInTz,
  parseHHmmToMinutes,
} from "../services/dateService.js";

function computeLateAndPenalty(now, settings, baseSalary) {
  const tz = settings.companyTimeZone;
  const startMin = parseHHmmToMinutes(settings.workdayStartTime);
  if (startMin == null) return { isLate: false, latePenaltyAmount: 0 };
  const currentMin = minutesSinceMidnightInTz(now, tz);
  const threshold = startMin + (settings.lateGraceMinutes || 0);
  const isLate = currentMin > threshold;
  if (!isLate || !settings.latePenaltyEnabled) {
    return { isLate: false, latePenaltyAmount: 0 };
  }
  const proration = settings.salaryProrationDays || 22;
  const perDay = proration > 0 ? baseSalary / proration : 0;
  if (settings.latePenaltyMode === "fixed_amount") {
    return { isLate: true, latePenaltyAmount: settings.latePenaltyFixedAmount || 0 };
  }
  return { isLate: true, latePenaltyAmount: Math.round((perDay / 2) * 100) / 100 };
}

export async function checkIn(req, res) {
  const { latitude, longitude } = req.body;
  const settings = await getOrCreateSettings();
  const ok = isWithinRadius(
    latitude,
    longitude,
    settings.officeLatitude,
    settings.officeLongitude,
    settings.officeRadiusMeters
  );
  if (!ok) {
    return res.status(403).json({
      message: "Check-in blocked: you are outside the allowed office radius.",
      code: "GEO_BLOCKED",
    });
  }

  const now = new Date();
  const dateKey = dateKeyInTimeZone(now, settings.companyTimeZone);
  const existing = await Attendance.findOne({ userId: req.user._id, dateKey });
  if (existing?.checkInAt) {
    return res.status(400).json({ message: "Already checked in today" });
  }

  const { isLate, latePenaltyAmount } = computeLateAndPenalty(now, settings, req.user.baseSalary || 0);

  const doc = await Attendance.findOneAndUpdate(
    { userId: req.user._id, dateKey },
    {
      $setOnInsert: { userId: req.user._id, dateKey },
      $set: {
        checkInAt: now,
        checkInLatitude: latitude,
        checkInLongitude: longitude,
        isLate,
        latePenaltyAmount,
        geoBlocked: false,
      },
    },
    { upsert: true, new: true }
  );

  return res.json({
    message: "Checked in",
    attendance: doc,
  });
}

export async function checkOut(req, res) {
  const { latitude, longitude } = req.body;
  const settings = await getOrCreateSettings();
  const ok = isWithinRadius(
    latitude,
    longitude,
    settings.officeLatitude,
    settings.officeLongitude,
    settings.officeRadiusMeters
  );
  if (!ok) {
    return res.status(403).json({
      message: "Check-out blocked: you are outside the allowed office radius.",
      code: "GEO_BLOCKED",
    });
  }

  const now = new Date();
  const dateKey = dateKeyInTimeZone(now, settings.companyTimeZone);
  const doc = await Attendance.findOne({ userId: req.user._id, dateKey });
  if (!doc?.checkInAt) {
    return res.status(400).json({ message: "Check in first" });
  }
  if (doc.checkOutAt) {
    return res.status(400).json({ message: "Already checked out today" });
  }

  doc.checkOutAt = now;
  doc.checkOutLatitude = latitude;
  doc.checkOutLongitude = longitude;
  await doc.save();

  return res.json({ message: "Checked out", attendance: doc });
}

export async function today(req, res) {
  const settings = await getOrCreateSettings();
  const dateKey = dateKeyInTimeZone(new Date(), settings.companyTimeZone);
  const doc = await Attendance.findOne({ userId: req.user._id, dateKey });
  return res.json({ dateKey, attendance: doc || null, settingsSummary: {
    workdayStartTime: settings.workdayStartTime,
    lateGraceMinutes: settings.lateGraceMinutes,
    companyTimeZone: settings.companyTimeZone,
  }});
}

export async function myHistory(req, res) {
  const limit = Math.min(Number(req.query.limit) || 60, 200);
  const rows = await Attendance.find({ userId: req.user._id })
    .sort({ dateKey: -1 })
    .limit(limit);
  return res.json(rows);
}

export async function adminReport(req, res) {
  const { userId, from, to } = req.query;
  const q = {};
  if (userId) q.userId = userId;
  if (from || to) {
    q.dateKey = {};
    if (from) q.dateKey.$gte = String(from);
    if (to) q.dateKey.$lte = String(to);
  }
  const rows = await Attendance.find(q).sort({ dateKey: -1 }).limit(500).populate("userId", "name email");
  return res.json(rows);
}
