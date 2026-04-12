import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

export async function notifyAdmins({ type, title, body, meta }) {
  const admins = await User.find({ role: "admin", isActive: true }).select("_id");
  const docs = admins.map((a) => ({
    userId: a._id,
    type,
    title,
    body,
    meta,
  }));
  if (docs.length) await Notification.insertMany(docs);
}

export async function notifyUser(userId, { type, title, body, meta }) {
  await Notification.create({ userId, type, title, body, meta });
}
