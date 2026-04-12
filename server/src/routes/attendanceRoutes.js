import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  checkIn,
  checkOut,
  today,
  myHistory,
  adminReport,
} from "../controllers/attendanceController.js";

const r = Router();

r.post("/check-in", requireAuth(["employee"]), checkIn);
r.post("/check-out", requireAuth(["employee"]), checkOut);
r.get("/today", requireAuth(["employee"]), today);
r.get("/me", requireAuth(["employee"]), myHistory);
r.get("/report", requireAuth(["admin"]), adminReport);

export default r;
