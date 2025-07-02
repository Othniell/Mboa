const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Business = require("../models/Business");
const Hotel = require("../models/Hotel"); // Import the Hotel model for admin-added hotels
const { protect } = require("../middleware/authMiddleware");

// 🟢 Create a new business
router.post("/create", protect, async (req, res) => {
  try {
    const { name, type, description, address, lat, lng, pricePerNight, contact, email, priceCategory, cuisine, price, category, policies, amenities } = req.body;

    if (!name || !type || !lat || !lng || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const businessData = {
      owner: req.user.id,
      name,
      type,
      email,
      description,
      location: { address, lat: parseFloat(lat), lng: parseFloat(lng) },
      priceCategory,
      status: "pending",
    };

    // Handle fields based on business type
    if (type === "hotel") {
      businessData.contact = contact;
      businessData.pricePerNight = pricePerNight;
      businessData.policies = policies.split(",").map(p => p.trim());
      businessData.amenities = amenities.split(",").map(a => a.trim());
    } else if (type === "restaurant") {
      businessData.cuisine = cuisine;
      businessData.price = price;
    } else if (type === "activity") {
      businessData.category = category;
    }

    const business = new Business(businessData);
    await business.save();

    res.status(201).json({ message: "Business submitted for approval", business });
  } catch (err) {
    console.error("Error creating business:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟢 Approve a business submission (admin only)
router.post("/:id/approve", protect, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    business.status = "approved";
    await business.save();

    res.json({ message: "Business approved successfully", business });
  } catch (err) {
    console.error("Error approving business:", err);
    res.status(500).json({ message: "Server error while approving business" });
  }
});

// 🟢 Get hotel by ID (fetch from both Business and Hotel models)
router.get("/hotels/:id", async (req, res) => {
  const { id } = req.params;

  // Check if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid hotel ID format" });
  }

  try {
    // First check Business model for business-owner-created hotels
    let hotel = await Business.findById(id);
    if (hotel) {
      return res.json(hotel);  // Return the hotel data if found in Business model
    }

    // If not found in Business model, check Hotel model for admin-created hotels
    hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    res.json(hotel); // Send the hotel data from Hotel model
  } catch (err) {
    console.error("Error fetching hotel:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟢 Get all approved hotels (fetch approved businesses and admin-added hotels)
router.get("/hotels", async (req, res) => {
  try {
    // Fetch business-owner hotels
    const businessHotels = await Business.find({ type: "hotel", status: "approved" });

    // Fetch admin-added hotels
    const adminHotels = await Hotel.find({ type: "hotel" });

    // Combine both sets of hotels
    const allHotels = [...businessHotels, ...adminHotels];

    res.json(allHotels); // Send the combined hotels list
  } catch (err) {
    console.error("Error fetching hotels:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟢 Get all approved restaurants
router.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Business.find({ type: "restaurant", status: "approved" });
    res.json(restaurants);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟢 Get all approved activities
router.get("/activities", async (req, res) => {
  try {
    const activities = await Business.find({ type: "activity", status: "approved" });
    res.json(activities);
  } catch (err) {
    console.error("Error fetching activities:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
