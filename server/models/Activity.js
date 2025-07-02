const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who submitted
  name: { type: String, required: true },
  description: { type: String, required: true },
 
images: { type: [String], default: [], required: true },
   // URL or path to image
  location: { type: String, required: true },
  category: { type: String, required: true },
  priceCategory: {
  type: String,
  enum: ['Luxury', 'Mid-range', 'Economy'],
  required: true
},
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },

   isTrending: { type: Boolean, default: false },  // New field for trending

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  }
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
