const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["hotel", "restaurant", "activity"], required: true },
    description: { type: String },
    location: {
      lat: Number,
      lng: Number,
    },
    images: [String],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
