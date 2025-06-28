const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const Hotel = require("../models/Hotel"); // Assuming this is where you store manual entries.
const upload = require("../config/multer");
const authMiddleware = require("../middleware/auth");

// 🟢 Create a new business
router.post("/create", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      type,
      description,
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

    if (!name || !type || !lat || !lng || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const images = req.files?.map(file => file.path) || [];

    const businessData = {
      owner: req.user.id,
      name,
      type,
      email,
      description,
      location: {
        address: address || "",
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      images,
      priceCategory,
      status: "pending", // Default
    };

    if (type === "hotel") {
      businessData.contact = contact;
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

    return res.status(201).json({ message: "Business submitted for approval", business });
  } catch (err) {
    console.error("Business create error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟢 GET all approved hotels from both Business and manual Hotel entries
router.get("/hotels", async (req, res) => {
  try {
    // Fetching hotels from the Business collection (approved)
    const businessHotels = await Business.find({
      type: "hotel",
      status: "approved",
    });

    // Fetching manually added hotels from the Hotel collection
    const manualHotels = await Hotel.find({
      status: "approved", // Assuming the status field is used to manage approval
    });

    // Combine the two results
    const allHotels = [...businessHotels, ...manualHotels];

    res.json(allHotels);
  } catch (err) {
    console.error("Failed to fetch hotels:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// (Optional: Add similar routes for restaurants and activities if needed)
// e.g. router.get("/restaurants", ...) or router.get("/activities", ...)

module.exports = router;
