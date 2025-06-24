const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: String,
  beds: Number,
  size: String,
  amenities: [String],
  priceCategory: {
    type: String,
    enum: ['Luxury', 'Mid-range', 'Economy'],
    required: true,
  },
});

// ✅ NEW: Booking schema (inline)
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomName: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const hotelSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  countryCode: { type: String },

  location: {
    address: { type: String },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },

  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  pricePerNight: Number,

  heroImage: { type: String },
  images: [String],

  description: { type: String },
  policies: [String],
  amenities: [String],

  facilities: {
    pool: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    spa: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    breakfastIncluded: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    conferenceRoom: { type: Boolean, default: false },
  },

  priceCategory: {
    type: String,
    enum: ['Luxury', 'Mid-range', 'Economy'],
    required: true,
  },

  rooms: [roomSchema],

  // ✅ NEW: Bookings array
  bookings: [bookingSchema],

  documents: [String],

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;
