const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who submitted
  name: { type: String, required: true },
  description: String,
  location: String,
  images: [String],
  cuisine: String,
  priceCategory: {
    type: String,
    enum: ['Luxury', 'Mid-range', 'Economy'], // Price categories available
    required: true
  },
  price: Number, // Optional: You can still keep this if you want to store the raw price.
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  averageRating: { type: Number, default: 0 },
  reviews: [reviewSchema],

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
