import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { employeeDashboard, adminDashboard } from "../controllers/dashboardController.js";

const r = Router();

r.get("/employee", requireAuth(["employee"]), employeeDashboard);
r.get("/admin", requireAuth(["admin"]), adminDashboard);

export default r;
