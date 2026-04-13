import { body, validationResult } from "express-validator";
import { Resignation } from "../models/Resignation.js";
import { Feedback } from "../models/Feedback.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

export const getResignations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const resignations = await Resignation.find(query)
      .populate("userId", "name email")
      .populate("decidedBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resignation.countDocuments(query);

    res.json({
      resignations,
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

export const getMyResignation = async (req, res) => {
  try {
    const resignation = await Resignation.findOne({ userId: req.user._id })
      .populate("decidedBy", "name");

    if (!resignation) {
      return res.status(404).json({ message: "No resignation found" });
    }

    res.json(resignation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const submitResignation = [
  body("reason").trim().isLength({ min: 10 }).withMessage("Reason must be at least 10 characters"),
  body("lastWorkingDay").isISO8601().withMessage("Invalid date format"),
  body("feedback").optional().trim(),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { reason, lastWorkingDay, feedback } = req.body;

      // Check if user already has a pending resignation
      const existing = await Resignation.findOne({
        userId: req.user._id,
        status: { $in: ["pending", "approved"] }
      });

      if (existing) {
        return res.status(400).json({ message: "You already have a pending or approved resignation" });
      }

      const resignation = new Resignation({
        userId: req.user._id,
        reason,
        lastWorkingDay: new Date(lastWorkingDay),
        feedback,
      });

      await resignation.save();

      // Create exit feedback if provided
      if (feedback) {
        const exitFeedback = new Feedback({
          userId: req.user._id,
          type: "exit",
          rating: 3, // Default rating for exit feedback
          comment: feedback,
          resignationId: resignation._id,
        });
        await exitFeedback.save();
      }

      // Notify admins
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          type: "resignation_submitted",
          title: "New Resignation Submitted",
          body: `${req.user.name} has submitted a resignation request`,
          meta: { resignationId: resignation._id },
        });
      }

      res.status(201).json({ message: "Resignation submitted successfully", resignation });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const updateResignationStatus = [
  body("status").isIn(["approved", "rejected"]).withMessage("Invalid status"),
  body("adminComment").optional().trim(),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { id } = req.params;
      const { status, adminComment } = req.body;

      const resignation = await Resignation.findById(id).populate("userId", "name email");
      if (!resignation) {
        return res.status(404).json({ message: "Resignation not found" });
      }

      resignation.status = status;
      resignation.adminComment = adminComment || "";
      resignation.decidedAt = new Date();
      resignation.decidedBy = req.user._id;

      await resignation.save();

      // Notify employee
      await Notification.create({
        userId: resignation.userId._id,
        type: "resignation_status_update",
        title: `Resignation ${status}`,
        body: `Your resignation request has been ${status}`,
        meta: { resignationId: resignation._id },
      });

      res.json({ message: `Resignation ${status} successfully`, resignation });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];