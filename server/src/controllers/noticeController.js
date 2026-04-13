import { body, validationResult } from "express-validator";
import { Notice } from "../models/Notice.js";

export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createNotice = [
  body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
  body("description").trim().isLength({ min: 1 }).withMessage("Description is required"),
  body("date").isISO8601().withMessage("Invalid date"),
  body("isImportant").optional().isBoolean(),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { title, description, date, isImportant } = req.body;

      const notice = new Notice({
        title,
        description,
        date: new Date(date),
        isImportant: isImportant || false,
        createdBy: req.user._id,
      });

      await notice.save();

      res.status(201).json({ message: "Notice created successfully", notice });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const updateNotice = [
  body("title").optional().trim().isLength({ min: 1 }).withMessage("Title cannot be empty"),
  body("description").optional().trim().isLength({ min: 1 }).withMessage("Description cannot be empty"),
  body("date").optional().isISO8601().withMessage("Invalid date"),
  body("isImportant").optional().isBoolean(),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      if (updates.date) updates.date = new Date(updates.date);

      const notice = await Notice.findByIdAndUpdate(id, updates, { new: true });
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }

      res.json({ message: "Notice updated successfully", notice });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findByIdAndDelete(id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};