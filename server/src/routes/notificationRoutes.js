import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listMine, markRead, markAllRead } from "../controllers/notificationController.js";

const r = Router();

r.get("/", requireAuth(), listMine);
r.patch("/:id/read", requireAuth(), markRead);
r.post("/read-all", requireAuth(), markAllRead);

export default r;
