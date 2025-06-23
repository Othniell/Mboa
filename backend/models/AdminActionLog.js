const mongoose = require("mongoose");

const adminActionLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  action: { type: String, enum: ["approved", "rejected"], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AdminActionLog", adminActionLogSchema);
