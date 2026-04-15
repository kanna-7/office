import { body, validationResult } from "express-validator";
import { Event } from "../models/Event.js";

export const getEvents = async (req, res) => {
  try {
    const { type, year, month } = req.query;
    const query = {};

    if (type) query.type = type;
    if (year) {
      const start = new Date(year, month ? month - 1 : 0, 1);
      const end = month
        ? new Date(year, month, 0, 23, 59, 59, 999)
        : new Date(year, 11, 31, 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const events = await Event.find(query)
      .populate("createdBy", "name")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createEvent = [
  body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
  body("description").optional().trim(),
  body("date").isISO8601().withMessage("Invalid date"),
  body("type").isIn(["holiday", "meeting", "important"]).withMessage("Invalid event type"),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { title, description, date, type } = req.body;

      // Use UTC midnight so the stored ISO date matches the intended calendar date
      const event = new Event({
        title,
        description,
        date: new Date(date + "T00:00:00.000Z"),
        type,
        createdBy: req.user._id,
      });

      await event.save();

      res.status(201).json({ message: "Event created successfully", event });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const updateEvent = [
  body("title").optional().trim().isLength({ min: 1 }).withMessage("Title cannot be empty"),
  body("description").optional().trim(),
  body("date").optional().isISO8601().withMessage("Invalid date"),
  body("type").optional().isIn(["holiday", "meeting", "important"]).withMessage("Invalid event type"),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      if (updates.date) {
        updates.date = new Date(updates.date + "T00:00:00.000Z");
      }

      const event = await Event.findByIdAndUpdate(id, updates, { new: true });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json({ message: "Event updated successfully", event });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};