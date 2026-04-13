import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();

// Public routes
router.get("/", getEvents);

// Admin routes
router.post("/", requireAuth(["admin"]), createEvent);
router.patch("/:id", requireAuth(["admin"]), updateEvent);
router.delete("/:id", requireAuth(["admin"]), deleteEvent);

export default router;