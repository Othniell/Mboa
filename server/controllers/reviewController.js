const Review = require("../models/Review");

const createReview = async (req, res) => {
  try {
    const { rating, comment, hotelId, restaurantId, activityId } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const imagePaths = req.files ? req.files.map(f => `/uploads/reviews/${f.filename}`) : [];

    const review = new Review({
      user: req.user._id,
      rating,
      comment,
      hotel: hotelId || null,
      restaurant: restaurantId || null,
      activity: activityId || null,
      images: imagePaths,
    });

    await review.save();

    const populatedReview = await Review.findById(review._id).populate("user", "username email");
    res.status(201).json(populatedReview);
  } catch (err) {
    console.error("Review error:", err.message);
    res.status(500).json({ message: "Server error while creating review" });
  }
};

module.exports = { createReview };
