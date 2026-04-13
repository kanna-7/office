import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  uploadSOP,
  getSOPs,
  uploadSOPFile,
  downloadSOP,
  deleteSOP,
} from "../controllers/sopController.js";

const router = express.Router();

// Employee routes
router.get("/", requireAuth(["employee", "admin"]), getSOPs);
router.get("/download/:id", requireAuth(["employee", "admin"]), downloadSOP);

// Admin routes
router.post("/upload", requireAuth(["admin"]), uploadSOP.single("sop"), uploadSOPFile);
router.delete("/:id", requireAuth(["admin"]), deleteSOP);

export default router;