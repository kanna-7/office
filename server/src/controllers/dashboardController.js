import { Attendance } from "../models/Attendance.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { getOrCreateSettings } from "../models/SystemSettings.js";
import { computeLeaveExtraDays } from "../services/leaveBalanceService.js";
import { buildMonthlySalaryForUser } from "../services/salaryService.js";
import { MonthlySalaryRecord } from "../models/MonthlySalaryRecord.js";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { dateKeyInTimeZone } from "../services/dateService.js";

export async function employeeDashboard(req, res) {
  const now = new Date();
  const settings = await getOrCreateSettings();
  const normalizedDateKey = dateKeyInTimeZone(now, settings.companyTimeZone);
  const [yStr, mStr] = normalizedDateKey.split("-");
  const year = Number(yStr);
  const month = Number(mStr);

  const attendance = await Attendance.findOne({ userId: req.user._id, dateKey: normalizedDateKey });
  const leave = await computeLeaveExtraDays(req.user._id, year, month);
  const salaryPreview = await buildMonthlySalaryForUser(req.user._id, year, month);
  const latestRecord = await MonthlySalaryRecord.findOne({ userId: req.user._id }).sort({
    year: -1,
    month: -1,
  });
  const unreadNotifications = await Notification.countDocuments({
    userId: req.user._id,
    readAt: null,
  });
  const recentLeaves = await LeaveRequest.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5);

  const me = await User.findById(req.user._id).lean();

  return res.json({
    today: { dateKey: normalizedDateKey, attendance },
    leaveBalance: {
      allowance: leave.allowance,
      usedApprovedDaysThisMonth: leave.used,
      extraChargeableDays: leave.extra,
    },
    salaryPreview,
    latestPayslipRecordId: latestRecord?._id || null,
    unreadNotifications,
    recentLeaves,
    profile: {
      responsibilities: me?.responsibilities || [],
      hrRemarks: me?.hrRemarks || "",
      performanceMonthly: me?.performanceMonthly || [],
      feedbacks: me?.feedbacks || [],
    },
  });
}

export async function adminDashboard(req, res) {
  const empCount = await User.countDocuments({ role: "employee", isActive: true });
  const pendingLeaves = await LeaveRequest.countDocuments({ status: "pending" });
  const unread = await Notification.countDocuments({ userId: req.user._id, readAt: null });
  const s = await getOrCreateSettings();
  const todayKeys = dateKeyInTimeZone(new Date(), s.companyTimeZone);
  const checkedInToday = await Attendance.countDocuments({ dateKey: todayKeys, checkInAt: { $ne: null } });

  return res.json({
    activeEmployees: empCount,
    pendingLeaveRequests: pendingLeaves,
    adminUnreadNotifications: unread,
    checkInsToday: checkedInToday,
    serverDateKey: todayKeys,
  });
}
