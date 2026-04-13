import { body, validationResult } from "express-validator";
import { WorkUpdate } from "../models/WorkUpdate.js";

export const getMyWorkUpdates = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const workUpdates = await WorkUpdate.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WorkUpdate.countDocuments({ userId: req.user._id });

    res.json({
      workUpdates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const submitWorkUpdate = [
  body("date").isISO8601().withMessage("Invalid date"),
  body("tasksCompleted").trim().isLength({ min: 1 }).withMessage("Tasks completed is required"),
  body("workHours").isFloat({ min: 0, max: 24 }).withMessage("Work hours must be between 0 and 24"),
  body("notes").optional().trim(),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { date, tasksCompleted, workHours, notes } = req.body;

      // Check if update already exists for this date
      const existing = await WorkUpdate.findOne({
        userId: req.user._id,
        date: new Date(date),
      });

      if (existing) {
        return res.status(400).json({ message: "Work update already exists for this date" });
      }

      const workUpdate = new WorkUpdate({
        userId: req.user._id,
        date: new Date(date),
        tasksCompleted,
        workHours: parseFloat(workHours),
        notes,
      });

      await workUpdate.save();

      res.status(201).json({ message: "Work update submitted successfully", workUpdate });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const updateWorkUpdate = [
  body("tasksCompleted").optional().trim().isLength({ min: 1 }).withMessage("Tasks completed cannot be empty"),
  body("workHours").optional().isFloat({ min: 0, max: 24 }).withMessage("Work hours must be between 0 and 24"),
  body("notes").optional().trim(),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      const workUpdate = await WorkUpdate.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        updates,
        { new: true }
      );

      if (!workUpdate) {
        return res.status(404).json({ message: "Work update not found" });
      }

      res.json({ message: "Work update updated successfully", workUpdate });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const getAllWorkUpdates = async (req, res) => {
  try {
    const { userId, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const workUpdates = await WorkUpdate.find(query)
      .populate("userId", "name email")
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WorkUpdate.countDocuments(query);

    res.json({
      workUpdates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};