import { body, validationResult } from "express-validator";
import { Feedback } from "../models/Feedback.js";

export const getFeedbacks = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const query = {};
    if (type) query.type = type;

    const feedbacks = await Feedback.find(query)
      .populate("userId", "name email")
      .populate("resignationId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(query);

    res.json({
      feedbacks,
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

export const submitFeedback = [
  body("type").isIn(["company", "exit"]).withMessage("Invalid feedback type"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().trim(),
  body("anonymous").optional().isBoolean(),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { type, rating, comment, anonymous } = req.body;

      const feedback = new Feedback({
        userId: req.user._id,
        type,
        rating,
        comment,
        anonymous: anonymous || false,
      });

      await feedback.save();

      res.status(201).json({ message: "Feedback submitted successfully", feedback });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const getFeedbackAnalytics = async (req, res) => {
  try {
    const companyFeedback = await Feedback.find({ type: "company" });
    const exitFeedback = await Feedback.find({ type: "exit" });

    const calculateStats = (feedbacks) => {
      if (feedbacks.length === 0) return { average: 0, count: 0, distribution: {} };

      const total = feedbacks.reduce((sum, f) => sum + f.rating, 0);
      const distribution = feedbacks.reduce((dist, f) => {
        dist[f.rating] = (dist[f.rating] || 0) + 1;
        return dist;
      }, {});

      return {
        average: total / feedbacks.length,
        count: feedbacks.length,
        distribution,
      };
    };

    res.json({
      company: calculateStats(companyFeedback),
      exit: calculateStats(exitFeedback),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};