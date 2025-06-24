// models/Trip.js
const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  budget: Number,
  startDate: Date,
  endDate: Date,
  hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],
  restaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);
