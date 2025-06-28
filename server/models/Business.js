const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["hotel", "restaurant", "activity"],
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String },

  // Common for all types
  location: {
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  images: [String],
  priceCategory: {
    type: String,
    enum: ["Luxury", "Mid-range", "Economy"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  // For Hotel
  contact: { type: String },
  email: { type: String },
  pricePerNight: { type: Number },
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

  // For Restaurant
  cuisine: { type: String },
  price: { type: Number },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      images: [String],
      createdAt: { type: Date, default: Date.now },
    },
  ],
  averageRating: { type: Number, default: 0 },

  // For Activity
  category: { type: String },
}, { timestamps: true });

// Add validation for conditional fields
businessSchema.path('contact').validate(function(value) {
  return this.type !== "hotel" || value != null; // Ensure contact is provided for hotels
}, 'Contact information is required for hotels.');

businessSchema.path('email').validate(function(value) {
  return this.type !== "hotel" || value != null; // Ensure email is provided for hotels
}, 'Email is required for hotels.');

businessSchema.path('pricePerNight').validate(function(value) {
  return this.type !== "hotel" || value != null; // Ensure pricePerNight is provided for hotels
}, 'Price per night is required for hotels.');

module.exports = mongoose.model("Business", businessSchema);
