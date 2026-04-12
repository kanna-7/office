import { Notification } from "../models/Notification.js";

export async function listMine(req, res) {
  const rows = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  return res.json(rows);
}

export async function markRead(req, res) {
  const { id } = req.params;
  const n = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { readAt: new Date() },
    { new: true }
  );
  if (!n) return res.status(404).json({ message: "Not found" });
  return res.json(n);
}

export async function markAllRead(req, res) {
  await Notification.updateMany({ userId: req.user._id, readAt: null }, { readAt: new Date() });
  return res.json({ ok: true });
}
