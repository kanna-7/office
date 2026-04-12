import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export function requireAuth(roles) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ message: "Server misconfiguration" });
      }
      const payload = jwt.verify(token, secret);
      const user = await User.findById(payload.sub);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid or inactive user" });
      }
      if (roles && roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}
