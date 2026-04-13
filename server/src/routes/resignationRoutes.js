import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getResignations,
  getMyResignation,
  submitResignation,
  updateResignationStatus,
} from "../controllers/resignationController.js";

const router = express.Router();

// Employee routes
router.get("/my", requireAuth(["employee"]), getMyResignation);
router.post("/", requireAuth(["employee"]), submitResignation);

// Admin routes
router.get("/", requireAuth(["admin"]), getResignations);
router.patch("/:id/status", requireAuth(["admin"]), updateResignationStatus);

export default router;