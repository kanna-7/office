import { body, validationResult } from "express-validator";
import { Policy } from "../models/Policy.js";
import { PolicyAcceptance } from "../models/PolicyAcceptance.js";

export const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createPolicy = [
  body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
  body("content").trim().isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),
  body("version").trim().isLength({ min: 1 }).withMessage("Version is required"),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { title, content, version } = req.body;

      const policy = new Policy({
        title,
        content,
        version,
        createdBy: req.user._id,
      });

      await policy.save();

      res.status(201).json({ message: "Policy created successfully", policy });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const acceptPolicy = async (req, res) => {
  try {
    const { policyId } = req.params;

    const policy = await Policy.findById(policyId);
    if (!policy || !policy.isActive) {
      return res.status(404).json({ message: "Policy not found or inactive" });
    }

    // Check if already accepted
    const existing = await PolicyAcceptance.findOne({
      userId: req.user._id,
      policyId,
    });

    if (existing) {
      return res.status(400).json({ message: "Policy already accepted" });
    }

    const acceptance = new PolicyAcceptance({
      userId: req.user._id,
      policyId,
    });

    await acceptance.save();

    res.json({ message: "Policy accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyPolicyAcceptances = async (req, res) => {
  try {
    const acceptances = await PolicyAcceptance.find({ userId: req.user._id })
      .populate("policyId", "title version")
      .sort({ acceptedAt: -1 });

    res.json(acceptances);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkPolicyAcceptance = async (req, res) => {
  try {
    const activePolicies = await Policy.find({ isActive: true });
    const acceptances = await PolicyAcceptance.find({
      userId: req.user._id,
      policyId: { $in: activePolicies.map(p => p._id) }
    });

    const acceptedPolicyIds = acceptances.map(a => a.policyId.toString());
    const unacceptedPolicies = activePolicies.filter(p => !acceptedPolicyIds.includes(p._id.toString()));

    res.json({
      allAccepted: unacceptedPolicies.length === 0,
      unacceptedPolicies,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};