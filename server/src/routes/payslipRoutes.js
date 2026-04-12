import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { downloadPayslip, viewPayslipJson } from "../controllers/payslipController.js";

const r = Router();

r.get("/:id/pdf", requireAuth(), downloadPayslip);
r.get("/:id", requireAuth(), viewPayslipJson);

export default r;
