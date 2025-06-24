const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  uploadHotelImages,
} = require("../controllers/hotelController");

const Hotel = require("../models/Hotel");
const { protect } = require("../middleware/authMiddleware");



// Multer config for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware to validate priceCategory
function validatePriceCategory(req, res, next) {
  const { priceCategory } = req.body;
  if (priceCategory && !['Luxury', 'Mid-range', 'Economy'].includes(priceCategory)) {
    return res.status(400).json({ error: "Invalid price category" });
  }
  next();
}

// ✅ Book a hotel (place this before `/:id`)
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

    // Avoid full document validation
    await Hotel.updateOne(
      { _id: req.params.id },
      { $push: { bookings: booking } },
      { runValidators: false } // 🔥 THIS disables full hotel validation
    );

    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Other Routes
router.get("/", getAllHotels);
router.post("/", validatePriceCategory, createHotel);
router.put("/:id", validatePriceCategory, updateHotel);
router.delete("/:id", deleteHotel);
router.post("/:id/images", upload.array("images", 10), uploadHotelImages);
router.get("/:id", getHotelById);

module.exports = router;
