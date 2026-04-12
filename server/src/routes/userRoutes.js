import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMe,
  getEmployeeById,
  listEmployees,
  createEmployee,
  updateEmployee,
} from "../controllers/userController.js";

const r = Router();

r.get("/me", requireAuth(), getMe);
r.get("/", requireAuth(["admin"]), listEmployees);
r.get("/:id", requireAuth(["admin"]), getEmployeeById);
r.post("/", requireAuth(["admin"]), createEmployee);
r.patch("/:id", requireAuth(["admin"]), updateEmployee);

export default r;
