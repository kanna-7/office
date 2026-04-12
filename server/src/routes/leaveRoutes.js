import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createLeave,
  myLeaves,
  pendingLeaves,
  decideLeave,
} from "../controllers/leaveController.js";

const r = Router();

r.post("/", requireAuth(["employee"]), createLeave);
r.get("/me", requireAuth(["employee"]), myLeaves);
r.get("/pending", requireAuth(["admin"]), pendingLeaves);
r.patch("/:id/decision", requireAuth(["admin"]), decideLeave);

export default r;
