import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  mySalaryPreview,
  myRecords,
  adminListRecords,
  adminGeneratePayroll,
  adminPreviewEmployee,
} from "../controllers/salaryController.js";

const r = Router();

r.get("/me/preview", requireAuth(["employee"]), mySalaryPreview);
r.get("/me/records", requireAuth(["employee"]), myRecords);
r.get("/records", requireAuth(["admin"]), adminListRecords);
r.get("/preview", requireAuth(["admin"]), adminPreviewEmployee);
r.post("/generate", requireAuth(["admin"]), adminGeneratePayroll);

export default r;
