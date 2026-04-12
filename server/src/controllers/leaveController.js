import { LeaveRequest } from "../models/LeaveRequest.js";
import { getOrCreateSettings } from "../models/SystemSettings.js";
import { inclusiveCalendarDays } from "../services/dateService.js";
import { notifyAdmins, notifyUser } from "../services/notificationService.js";

export async function createLeave(req, res) {
  const { startDate, endDate, reason, adminTag } = req.body;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "startDate and endDate required" });
  }
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (e < s) {
    return res.status(400).json({ message: "endDate must be on or after startDate" });
  }
  const settings = await getOrCreateSettings();
  const totalDays = inclusiveCalendarDays(s, e, settings.companyTimeZone);

  const leave = await LeaveRequest.create({
    userId: req.user._id,
    startDate: s,
    endDate: e,
    totalDays,
    reason: reason || "",
    adminTag: adminTag || "",
  });

  await notifyAdmins({
    type: "leave_request",
    title: "New leave request",
    body: `${req.user.name} requested leave (${totalDays} day(s)).`,
    meta: { leaveId: leave._id.toString(), userId: req.user._id.toString() },
  });

  return res.status(201).json(leave);
}

export async function myLeaves(req, res) {
  const rows = await LeaveRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.json(rows);
}

export async function pendingLeaves(req, res) {
  const rows = await LeaveRequest.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .populate("userId", "name email");
  return res.json(rows);
}

export async function decideLeave(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "status must be approved or rejected" });
  }
  const leave = await LeaveRequest.findById(id).populate("userId", "name email");
  if (!leave) return res.status(404).json({ message: "Not found" });
  if (leave.status !== "pending") {
    return res.status(400).json({ message: "Leave already decided" });
  }
  leave.status = status;
  leave.decidedAt = new Date();
  leave.decidedBy = req.user._id;
  await leave.save();

  const employeeId = leave.userId?._id || leave.userId;
  await notifyUser(employeeId, {
    type: "leave_decision",
    title: `Leave ${status}`,
    body: `Your leave request from ${leave.startDate.toDateString()} was ${status}.`,
    meta: { leaveId: leave._id.toString(), status },
  });

  return res.json(leave);
}
