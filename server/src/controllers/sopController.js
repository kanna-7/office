import multer from "multer";
import path from "path";
import fs from "fs";
import { SOP } from "../models/SOP.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "sops");
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
  const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and Word documents are allowed."), false);
  }
};

export const uploadSOP = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export const getSOPs = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    const sops = await SOP.find(query)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.json(sops);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const uploadSOPFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, category } = req.body;

    const sop = new SOP({
      title,
      category,
      fileName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
    });

    await sop.save();

    res.status(201).json({ message: "SOP uploaded successfully", sop });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const downloadSOP = async (req, res) => {
  try {
    const { id } = req.params;
    const sop = await SOP.findById(id);

    if (!sop) {
      return res.status(404).json({ message: "SOP not found" });
    }

    if (!fs.existsSync(sop.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(sop.filePath, sop.fileName);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteSOP = async (req, res) => {
  try {
    const { id } = req.params;
    const sop = await SOP.findById(id);

    if (!sop) {
      return res.status(404).json({ message: "SOP not found" });
    }

    if (fs.existsSync(sop.filePath)) {
      fs.unlinkSync(sop.filePath);
    }

    await SOP.findByIdAndDelete(id);

    res.json({ message: "SOP deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};