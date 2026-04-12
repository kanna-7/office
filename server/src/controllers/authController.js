import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: "Account disabled" });
  }
  const token = signToken(user._id.toString());
  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      baseSalary: user.baseSalary,
    },
  });
}

/** One-time bootstrap when database has zero users */
export async function setupAdmin(req, res) {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      return res.status(403).json({
        message: "Bootstrap disabled: an account already exists. Use Log in instead.",
      });
    }
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "email, password, name required" });
    }
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role: "admin",
      baseSalary: 0,
    });
    const token = signToken(user._id.toString());
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        baseSalary: user.baseSalary,
      },
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error("setupAdmin", e);
    return res.status(500).json({ message: e.message || "Could not create admin" });
  }
}
