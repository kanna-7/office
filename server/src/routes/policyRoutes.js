import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getPolicies,
  createPolicy,
  acceptPolicy,
  getMyPolicyAcceptances,
  checkPolicyAcceptance,
} from "../controllers/policyController.js";

const router = express.Router();

// Public routes (for login page)
router.get("/active", getPolicies);

// Employee routes
router.get("/acceptance/check", requireAuth(["employee"]), checkPolicyAcceptance);
router.get("/my-acceptances", requireAuth(["employee"]), getMyPolicyAcceptances);
router.post("/:policyId/accept", requireAuth(["employee"]), acceptPolicy);

// Admin routes
router.get("/", requireAuth(["admin"]), getPolicies);
router.post("/", requireAuth(["admin"]), createPolicy);

export default router;