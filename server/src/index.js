import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import { getOrCreateSettings } from "./models/SystemSettings.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import payslipRoutes from "./routes/payslipRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import resignationRoutes from "./routes/resignationRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import sopRoutes from "./routes/sopRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import workUpdateRoutes from "./routes/workUpdateRoutes.js";
import internalFeedbackRoutes from "./routes/internalFeedbackRoutes.js";

const app = express();
const port = Number(process.env.PORT) || 7895;
/** Comma-separated list, e.g. http://localhost:3000,http://localhost:3001 */
const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isLocalhostOrigin(origin) {
  try {
    const u = new URL(origin);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (clientOrigins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== "production" && isLocalhostOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/payslips", payslipRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/resignations", resignationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/sops", sopRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/work-updates", workUpdateRoutes);
app.use("/api/internal-feedback", internalFeedbackRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

await connectDb();
await getOrCreateSettings();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
