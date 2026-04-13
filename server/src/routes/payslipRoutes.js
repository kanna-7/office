import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMyPayslips,
  getAllPayslips,
  generatePayslip,
  downloadPayslip
} from "../controllers/payslipController.js";

const r = Router();

// Employee routes
r.get("/my", requireAuth(["employee"]), getMyPayslips);

// Admin routes
r.get("/", requireAuth(["admin"]), getAllPayslips);
r.post("/generate", requireAuth(["admin"]), generatePayslip);

// Shared routes
r.get("/:id/download", requireAuth(["employee", "admin"]), downloadPayslip);

export default r;
