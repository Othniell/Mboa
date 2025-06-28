const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const Hotel = require("../models/Hotel");
const Business = require("../models/Business");

const {
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  uploadHotelImages,
} = require("../controllers/hotelController");

const { protect } = require("../middleware/authMiddleware");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware
function validatePriceCategory(req, res, next) {
  const { priceCategory } = req.body;
  if (priceCategory && !["Luxury", "Mid-range", "Economy"].includes(priceCategory)) {
    return res.status(400).json({ error: "Invalid price category" });
  }
  next();
}

// ✅ Booking route
router.post("/:id/book", protect, async (req, res) => {
  try {
    const { roomName, checkIn, checkOut, guests, totalPrice } = req.body;

    const booking = {
      user: req.user.id,
      roomName,
      checkIn,
      checkOut,
      guests,
      totalPrice,
    };

    await Hotel.updateOne(
      { _id: req.params.id },
      { $push: { bookings: booking } },
      { runValidators: false }
    );

    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ COMBINED hotel fetch route
router.get("/", async (req, res) => {
  try {
    const hotelsFromHotels = await Hotel.find({ status: "approved" });
    const hotelsFromBusinesses = await Business.find({ type: "hotel", status: "approved" });

    const allHotels = [...hotelsFromHotels, ...hotelsFromBusinesses];

    res.status(200).json(allHotels);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hotels", error: error.message });
  }
});

// CRUD + images
router.post("/", validatePriceCategory, createHotel);
router.put("/:id", validatePriceCategory, updateHotel);
router.delete("/:id", deleteHotel);
router.post("/:id/images", upload.array("images", 10), uploadHotelImages);
router.get("/:id", getHotelById);

module.exports = router;
