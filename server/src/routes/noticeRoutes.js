import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../controllers/noticeController.js";

const router = express.Router();

// Employee routes
router.get("/", requireAuth(["employee", "admin"]), getNotices);

// Admin routes
router.post("/", requireAuth(["admin"]), createNotice);
router.patch("/:id", requireAuth(["admin"]), updateNotice);
router.delete("/:id", requireAuth(["admin"]), deleteNotice);

export default router;