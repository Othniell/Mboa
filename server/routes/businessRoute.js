const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const upload = require("../config/multer");
const authMiddleware = require("../middleware/auth");

// POST /api/business/create
router.post("/create", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      location, // optional
      address,
      lat,
      lng,
      pricePerNight,
      contact,
      email,
      priceCategory,
      cuisine,
      price,
      category,
      policies,
      amenities,
    } = req.body;

    if (!name || !type || !lat || !lng || !priceCategory) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const images = req.files?.map(file => file.path) || [];

    const businessData = {
      owner: req.user.id,
      name,
      type,
      description,
      location: {
        address: address || "",
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      images,
      priceCategory,
      status: "pending",
    };

    // Conditional fields based on type
    if (type === "hotel") {
      businessData.contact = contact;
      businessData.email = email;
      if (pricePerNight) businessData.pricePerNight = parseFloat(pricePerNight);
      if (policies) businessData.policies = policies.split(",").map(p => p.trim());
      if (amenities) businessData.amenities = amenities.split(",").map(a => a.trim());
    }

    if (type === "restaurant") {
      if (cuisine) businessData.cuisine = cuisine;
      if (price) businessData.price = parseFloat(price);
    }

    if (type === "activity") {
      if (category) businessData.category = category;
    }

    const business = new Business(businessData);
    await business.save();

    // No email notification (removed nodemailer part)

    return res.status(201).json({ message: "Business submitted for approval", business });
  } catch (err) {
    console.error("Business create error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
