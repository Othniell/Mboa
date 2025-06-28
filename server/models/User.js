const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true 
    },
    role: {
      type: String,
      enum: ["visitor", "business", "admin"], 
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    // Business fields (only for business users)
    businessName: {
      type: String,
      required: function() { return this.role === "business"; }, // Required only for business role
    },
    businessImages: [{ type: String }],
    businessDocs: [{ type: String }],
  },
  { timestamps: true }
);

// Method to compare passwords during login
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Add a hook to validate business-related fields only for business users
userSchema.pre('save', function(next) {
  if (this.role === "business") {
    if (!this.businessName) {
      return next(new Error('Business name is required for business users.'));
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
