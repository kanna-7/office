import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  upload,
  getMyDocuments,
  uploadDocument,
  downloadDocument,
  getAllDocuments,
  verifyDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// Employee routes
router.get("/my", requireAuth(["employee"]), getMyDocuments);
router.post("/upload", requireAuth(["employee"]), upload.single("document"), uploadDocument);
router.get("/download/:id", requireAuth(["employee", "admin"]), downloadDocument);
router.delete("/:id", requireAuth(["employee", "admin"]), deleteDocument);

// Admin routes
router.get("/", requireAuth(["admin"]), getAllDocuments);
router.patch("/:id/verify", requireAuth(["admin"]), verifyDocument);

export default router;