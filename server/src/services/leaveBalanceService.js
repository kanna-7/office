import { LeaveRequest } from "../models/LeaveRequest.js";
import { getOrCreateSettings } from "../models/SystemSettings.js";
import { dateKeyInTimeZone, inclusiveCalendarDays } from "./dateService.js";

/**
 * Approved leave days overlapping [monthStart, monthEnd] in company TZ.
 */
export async function approvedLeaveDaysInMonth(userId, year, month, companyTimeZone) {
  const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const leaves = await LeaveRequest.find({
    userId,
    status: "approved",
    startDate: { $lte: monthEnd },
    endDate: { $gte: monthStart },
  }).lean();

  let total = 0;
  for (const lv of leaves) {
    const s = lv.startDate > monthStart ? lv.startDate : monthStart;
    const e = lv.endDate < monthEnd ? lv.endDate : monthEnd;
    const days = inclusiveCalendarDays(s, e, companyTimeZone);
    /** If stored totalDays is smaller segment, prefer proportional — simple: count calendar overlap */
    total += days;
  }
  return total;
}

export async function computeLeaveExtraDays(userId, year, month) {
  const settings = await getOrCreateSettings();
  const used = await approvedLeaveDaysInMonth(userId, year, month, settings.companyTimeZone);
  const allowance = settings.monthlyLeaveAllowanceDays || 0;
  const extra = Math.max(0, used - allowance);
  return { used, allowance, extra, companyTimeZone: settings.companyTimeZone };
}
