import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMyWorkUpdates,
  submitWorkUpdate,
  updateWorkUpdate,
  getAllWorkUpdates,
} from "../controllers/workUpdateController.js";

const router = express.Router();

// Employee routes
router.get("/my", requireAuth(["employee"]), getMyWorkUpdates);
router.post("/", requireAuth(["employee"]), submitWorkUpdate);
router.patch("/:id", requireAuth(["employee"]), updateWorkUpdate);

// Admin routes
router.get("/", requireAuth(["admin"]), getAllWorkUpdates);

export default router;