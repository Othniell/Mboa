const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const { createReview } = require('../controllers/reviewController');

// Multer config to store files in /uploads/reviews
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/reviews");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 162376487.jpg
  },
});
const upload = multer({ storage });

// POST create review (for hotel, restaurant or activity)
router.post("/", protect, upload.array("images", 5), createReview);

// GET reviews by restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const Review = require("../models/Review");
   const reviews = await Review.find({ restaurant: req.params.restaurantId })
  .populate("user", "username email firstName lastName");

    console.log("Populated reviews:", reviews);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET reviews by hotel
router.get("/hotel/:hotelId", async (req, res) => {
  try {
    const Review = require("../models/Review");
    const reviews = await Review.find({ hotel: req.params.hotelId }).populate("user", "username");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET reviews by activity
router.get("/activity/:activityId", async (req, res) => {
  try {
    const Review = require("../models/Review");
    const reviews = await Review.find({ activity: req.params.activityId }).populate("user", "username");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
