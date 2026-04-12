import { Router } from "express";
import { login, setupAdmin } from "../controllers/authController.js";

const r = Router();
r.post("/login", login);
r.post("/setup-admin", setupAdmin);

export default r;
