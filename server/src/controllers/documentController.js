import multer from "multer";
import path from "path";
import fs from "fs";
import { Document } from "../models/Document.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "documents");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and images are allowed."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { type } = req.body;
    const allowedTypes = ["10th_marksheet", "12th_marksheet", "certificate"];

    if (!allowedTypes.includes(type)) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Invalid document type" });
    }

    // Check if document type already exists for user
    const existing = await Document.findOne({
      userId: req.user._id,
      type,
      verified: true
    });

    if (existing) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Document of this type already exists and is verified" });
    }

    const document = new Document({
      userId: req.user._id,
      type,
      fileName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });

    await document.save();

    res.status(201).json({ message: "Document uploaded successfully", document });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if user owns the document or is admin
    if (document.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(document.filePath, document.fileName);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const { userId, type, verified, page = 1, limit = 10 } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (verified !== undefined) query.verified = verified === "true";

    const documents = await Document.find(query)
      .populate("userId", "name email")
      .populate("verifiedBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    res.json({
      documents,
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

export const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.verified = true;
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();

    await document.save();

    res.json({ message: "Document verified successfully", document });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if user owns the document or is admin
    if (document.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(id);

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};