import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { Payslip } from "../models/Payslip.js";
import { User } from "../models/User.js";

export async function getMyPayslips(req, res) {
  try {
    const payslips = await Payslip.find({ userId: req.user._id })
      .sort({ year: -1, month: -1 });

    res.json(payslips);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getAllPayslips(req, res) {
  try {
    const { userId, year, month, page = 1, limit = 10 } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);

    const payslips = await Payslip.find(query)
      .populate("userId", "name email")
      .populate("generatedBy", "name")
      .sort({ year: -1, month: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payslip.countDocuments(query);

    res.json({
      payslips,
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
}

export async function generatePayslip(req, res) {
  try {
    const { userId, month, year, basicSalary, hra, conveyance, medical, lta, otherAllowances, deductions } = req.body;

    // Check if payslip already exists
    const existing = await Payslip.findOne({ userId, month, year });
    if (existing) {
      return res.status(400).json({ message: "Payslip already exists for this period" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const grossSalary = basicSalary + hra + conveyance + medical + lta + otherAllowances;
    const netSalary = grossSalary - totalDeductions;

    const payslip = new Payslip({
      userId,
      month,
      year,
      basicSalary,
      hra,
      conveyance,
      medical,
      lta,
      otherAllowances,
      deductions,
      netSalary,
      generatedBy: req.user._id,
    });

    await payslip.save();

    res.status(201).json({ message: "Payslip generated successfully", payslip });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function downloadPayslip(req, res) {
  try {
    const { id } = req.params;
    const payslip = await Payslip.findById(id).populate("userId", "name email");

    if (!payslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }

    // Check permissions
    const requester = req.user;
    const ownerId = payslip.userId._id?.toString?.() || payslip.userId.toString();
    if (requester.role !== "admin" && ownerId !== requester._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const monthName = new Date(Date.UTC(payslip.year, payslip.month - 1, 1)).toLocaleString("en", {
      month: "long",
      year: "numeric",
    });

    // Generate PDF
    const fileName = `payslip-${payslip.userId.email}-${payslip.year}-${payslip.month}.pdf`;
    const filePath = path.join(process.cwd(), "uploads", "payslips", fileName);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // PDF content
    doc.fontSize(20).text("PAYSLIP", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Employee: ${payslip.userId.name}`);
    doc.text(`Email: ${payslip.userId.email}`);
    doc.text(`Period: ${monthName}`);
    doc.moveDown();

    doc.fontSize(12).text("Earnings:", { underline: true });
    doc.text(`Basic Salary: ₹${payslip.basicSalary.toFixed(2)}`);
    doc.text(`HRA: ₹${payslip.hra.toFixed(2)}`);
    doc.text(`Conveyance: ₹${payslip.conveyance.toFixed(2)}`);
    doc.text(`Medical: ₹${payslip.medical.toFixed(2)}`);
    doc.text(`LTA: ₹${payslip.lta.toFixed(2)}`);
    doc.text(`Other Allowances: ₹${payslip.otherAllowances.toFixed(2)}`);

    const gross = payslip.basicSalary + payslip.hra + payslip.conveyance + payslip.medical + payslip.lta + payslip.otherAllowances;
    doc.moveDown();
    doc.text(`Gross Salary: ₹${gross.toFixed(2)}`, { underline: true });

    doc.moveDown();
    doc.text("Deductions:", { underline: true });
    if (!payslip.deductions?.length) {
      doc.text("None");
    } else {
      for (const d of payslip.deductions) {
        doc.text(`- ${d.name}: ₹${d.amount.toFixed(2)}`);
      }
    }

    const totalDeductions = payslip.deductions.reduce((sum, d) => sum + d.amount, 0);
    doc.moveDown();
    doc.text(`Total Deductions: ₹${totalDeductions.toFixed(2)}`);
    doc.fontSize(14).text(`Net Salary: ₹${payslip.netSalary.toFixed(2)}`, { underline: true });

    doc.end();

    writeStream.on("finish", () => {
      // Update payslip with file path
      payslip.filePath = filePath;
      payslip.save();

      // Send file
      res.download(filePath, fileName);
    });

    writeStream.on("error", (error) => {
      res.status(500).json({ message: "Error generating PDF", error: error.message });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
