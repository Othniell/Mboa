const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: "hotel" },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  amenities: [String],
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [String],
  status: { type: String, enum: ["approved", "pending", "rejected"], default: "pending" },
}, { timestamps: true });

const HotelCollection = mongoose.model("HotelCollection", HotelSchema);
module.exports = HotelCollection;
