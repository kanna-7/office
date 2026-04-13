import { body, validationResult } from "express-validator";
import { InternalFeedback } from "../models/InternalFeedback.js";
import { User } from "../models/User.js";

export const getMyFeedback = async (req, res) => {
  try {
    const feedback = await InternalFeedback.find({ toUserId: req.user._id })
      .populate("fromUserId", "name email")
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const submitFeedback = [
  body("toUserId").isMongoId().withMessage("Invalid user ID"),
  body("type").isIn(["team", "manager"]).withMessage("Invalid feedback type"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().trim(),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { toUserId, type, rating, comment } = req.body;

      // Check if target user exists
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      // Prevent self-feedback
      if (toUserId === req.user._id.toString()) {
        return res.status(400).json({ message: "Cannot give feedback to yourself" });
      }

      const feedback = new InternalFeedback({
        fromUserId: req.user._id,
        toUserId,
        type,
        rating,
        comment,
      });

      await feedback.save();

      res.status(201).json({ message: "Feedback submitted successfully", feedback });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const getAllFeedback = async (req, res) => {
  try {
    const { userId, type, page = 1, limit = 10 } = req.query;
    const query = {};

    if (userId) query.toUserId = userId;
    if (type) query.type = type;

    const feedback = await InternalFeedback.find(query)
      .populate("fromUserId", "name email")
      .populate("toUserId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InternalFeedback.countDocuments(query);

    res.json({
      feedback,
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

export const getFeedbackAnalytics = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { toUserId: userId } : {};

    const feedback = await InternalFeedback.find(query);

    const analytics = {
      total: feedback.length,
      averageRating: feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0,
      byType: {
        team: feedback.filter(f => f.type === "team"),
        manager: feedback.filter(f => f.type === "manager"),
      },
      ratingDistribution: feedback.reduce((dist, f) => {
        dist[f.rating] = (dist[f.rating] || 0) + 1;
        return dist;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};