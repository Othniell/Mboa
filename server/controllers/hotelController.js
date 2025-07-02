const Hotel = require("../models/Hotel");
const Review = require("../models/Review");

// Backend example - HotelController.js
exports.getAllHotels = async (req, res) => {
  try {
    const filter = {};
    if (req.query.priceCategory) {
      filter.priceCategory = req.query.priceCategory;
    }

    // Fetch hotels and populate the reviews
    const hotels = await Hotel.find(filter).populate('reviews').lean(); // Populate reviews

    const enrichedHotels = hotels.map((hotel) => {
      const reviews = hotel.reviews || [];
      const reviewsCount = reviews.length;
      const avgRating = reviewsCount
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
        : 0;

      return {
        ...hotel,
        reviewsCount,
        averageRating: Number(avgRating.toFixed(1)),
      };
    });

    res.json(enrichedHotels);  // Make sure the response includes averageRating and reviewsCount
  } catch (err) {
    console.error("Failed to fetch hotels:", err);
    res.status(500).json({ error: err.message });
  }
};



exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const reviews = await Review.find({ hotel: req.params.id });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      ...hotel.toObject(),
      reviews,
      averageRating: Number(avgRating.toFixed(1)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.uploadHotelImages = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imageUrls = files.map(file =>
      `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    hotel.images = [...hotel.images, ...imageUrls];
    await hotel.save();

    res.status(200).json({ message: "Images uploaded", images: hotel.images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
