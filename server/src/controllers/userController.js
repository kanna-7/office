import { User } from "../models/User.js";

function profilePayload(u) {
  return {
    responsibilities: u.responsibilities || [],
    hrRemarks: u.hrRemarks || "",
    performanceMonthly: u.performanceMonthly || [],
    feedbacks: u.feedbacks || [],
  };
}

export async function getMe(req, res) {
  const u = await User.findById(req.user._id);
  return res.json({
    id: u._id,
    email: u.email,
    name: u.name,
    role: u.role,
    baseSalary: u.baseSalary,
    isActive: u.isActive,
    ...profilePayload(u),
  });
}

export async function getEmployeeById(req, res) {
  const u = await User.findOne({ _id: req.params.id, role: "employee" });
  if (!u) return res.status(404).json({ message: "Employee not found" });
  return res.json({
    id: u._id,
    email: u.email,
    name: u.name,
    baseSalary: u.baseSalary,
    isActive: u.isActive,
    createdAt: u.createdAt,
    ...profilePayload(u),
  });
}

export async function listEmployees(req, res) {
  const users = await User.find({ role: "employee" }).sort({ createdAt: -1 });
  return res.json(
    users.map((u) => ({
      id: u._id,
      email: u.email,
      name: u.name,
      baseSalary: u.baseSalary,
      isActive: u.isActive,
      createdAt: u.createdAt,
      responsibilityCount: (u.responsibilities && u.responsibilities.length) || 0,
    }))
  );
}

export async function createEmployee(req, res) {
  const { email, password, name, baseSalary } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "email, password, name required" });
  }
  try {
    const user = await User.create({
      email: String(email).toLowerCase(),
      password,
      name,
      role: "employee",
      baseSalary: Number(baseSalary) || 0,
    });
    return res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      baseSalary: user.baseSalary,
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(400).json({ message: e.message || "Could not create user" });
  }
}

export async function updateEmployee(req, res) {
  const { id } = req.params;
  const {
    name,
    baseSalary,
    isActive,
    password,
    responsibilities,
    hrRemarks,
    performanceMonthly,
    feedbacks,
  } = req.body;
  const user = await User.findOne({ _id: id, role: "employee" });
  if (!user) return res.status(404).json({ message: "Employee not found" });
  if (typeof name === "string") user.name = name;
  if (typeof baseSalary === "number") user.baseSalary = baseSalary;
  if (typeof isActive === "boolean") user.isActive = isActive;
  if (password) user.password = password;
  if (Array.isArray(responsibilities)) user.responsibilities = responsibilities;
  if (typeof hrRemarks === "string") user.hrRemarks = hrRemarks;
  if (Array.isArray(performanceMonthly)) user.performanceMonthly = performanceMonthly;
  if (Array.isArray(feedbacks)) user.feedbacks = feedbacks;
  await user.save();
  return res.json({
    id: user._id,
    email: user.email,
    name: user.name,
    baseSalary: user.baseSalary,
    isActive: user.isActive,
    ...profilePayload(user),
  });
}
