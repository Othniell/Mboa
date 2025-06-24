const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: "activity" },
  location: { type: String, required: true },
  duration: { type: String, required: true },  // e.g., "2 hours"
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [String],
  status: { type: String, enum: ["approved", "pending", "rejected"], default: "pending" },
}, { timestamps: true });

const ActivityCollection = mongoose.model("ActivityCollection", ActivitySchema);
module.exports = ActivityCollection;
