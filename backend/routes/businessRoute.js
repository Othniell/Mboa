const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const upload = require("../config/multer");
const authMiddleware = require("../middleware/auth");
const nodemailer = require("nodemailer");

// POST /api/business/create
router.post("/create", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { name, type, description, lat, lng } = req.body;

    if (!name || !type || !lat || !lng) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const images = req.files?.map(file => file.path) || [];

    const business = new Business({
      owner: req.user.id,
      name,
      type,
      description,
      location: { lat, lng },
      images,
      status: "pending", // Ensure status is pending on submit
    });

    await business.save();

    console.log("Preparing to send email notification...");

    // Nodemailer setup and email send
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "othnielmoube45@gmail.com",  // Your admin email here
      subject: "New Business Submission",
      text: `A new business named "${business.name}" has been submitted for approval.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email send error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(201).json({ message: "Business submitted for approval", business });
  } catch (err) {
    console.error("Business create error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router;
