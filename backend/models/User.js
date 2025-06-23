const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true }, // ✅ must be accessible
    role: {
      type: String,
      enum: ["visitor", "business", "admin"], // ✅ include admin
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    // Business fields (optional, only for business owners)
    businessName: { type: String },
    businessImages: [{ type: String }],
    businessDocs: [{ type: String }],
  },
  { timestamps: true }
);

// ✅ Method to compare passwords during login
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
