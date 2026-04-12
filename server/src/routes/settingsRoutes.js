import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getSettings, getPublicSettings, updateSettings } from "../controllers/settingsController.js";

const r = Router();

r.get("/public", requireAuth(["employee"]), getPublicSettings);
r.get("/", requireAuth(["admin"]), getSettings);
r.put("/", requireAuth(["admin"]), updateSettings);

export default r;
