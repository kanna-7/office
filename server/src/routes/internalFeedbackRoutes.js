import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMyFeedback,
  submitFeedback,
  getAllFeedback,
  getFeedbackAnalytics,
} from "../controllers/internalFeedbackController.js";

const router = express.Router();

// Employee routes
router.get("/my", requireAuth(["employee"]), getMyFeedback);
router.post("/", requireAuth(["employee"]), submitFeedback);

// Admin routes
router.get("/", requireAuth(["admin"]), getAllFeedback);
router.get("/analytics", requireAuth(["admin"]), getFeedbackAnalytics);

export default router;