import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getFeedbacks,
  submitFeedback,
  getFeedbackAnalytics,
} from "../controllers/feedbackController.js";

const router = express.Router();

// Employee routes
router.post("/", requireAuth(["employee"]), submitFeedback);

// Admin routes
router.get("/", requireAuth(["admin"]), getFeedbacks);
router.get("/analytics", requireAuth(["admin"]), getFeedbackAnalytics);

export default router;