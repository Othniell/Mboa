const express = require("express");
const router = express.Router();
const multer = require("multer");
const Activity = require("../models/Activity");
const Review = require("../models/Review");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Utility: Validate required fields for Activity creation/update
const validateActivity = (body) => {
  const requiredFields = ["name", "description", "location", "category", "image", "latitude", "longitude", "priceCategory"];
  for (const field of requiredFields) {
    if (!body[field] && body[field] !== 0) {
      return `${field} is required`;
    }
  }
  return null;
};

// Create new activity
router.post("/", async (req, res) => {
  const error = validateActivity(req.body);
  if (error) return res.status(400).json({ error });

  const { priceCategory } = req.body;
  if (!['Luxury', 'Mid-range', 'Economy'].includes(priceCategory)) {
    return res.status(400).json({ error: "Invalid price category" });
  }

  try {
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all activities with average rating and review count
router.get("/", async (req, res) => {
  try {
    const { priceCategory } = req.query;
    const filter = priceCategory ? { priceCategory } : {};
    const activities = await Activity.find(filter);
    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const reviews = await Review.find({ activity: activity._id });
        const reviewCount = reviews.length;
        const averageRating = reviewCount
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : 0;

        const images = activity.images?.length ? activity.images : [activity.image];

        return {
          ...activity.toObject(),
          averageRating: Number(averageRating.toFixed(1)),
          reviewCount,
          images,
        };
      })
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get one activity by ID with reviews and rating
router.get("/:id", async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const reviews = await Review.find({ activity: activity._id });
    const reviewCount = reviews.length;
    const averageRating = reviewCount
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

    const images = activity.images?.length ? activity.images : [activity.image];

    res.json({
      ...activity.toObject(),
      averageRating: Number(averageRating.toFixed(1)),
      reviewCount,
      images,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload images to existing activity
router.post("/:id/images", upload.array("images", 10), async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const imageUrls = req.files.map(file => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);
    activity.images = [...(activity.images || []), ...imageUrls];
    await activity.save();

    res.status(200).json({ message: "Images uploaded", images: activity.images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update activity
router.put("/:id", async (req, res) => {
  const error = validateActivity(req.body);
  if (error) return res.status(400).json({ error });

  const { priceCategory } = req.body;
  if (priceCategory && !['Luxury', 'Mid-range', 'Economy'].includes(priceCategory)) {
    return res.status(400).json({ error: "Invalid price category" });
  }

  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete activity
router.delete("/:id", async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
