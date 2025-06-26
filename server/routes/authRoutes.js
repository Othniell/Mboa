const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Load your secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "Mondenouvaux12";

// ✅ Signup route (no file uploads)
router.post("/signup", async (req, res) => {
  try {
    const {
      username,
      role,
      firstName,
      lastName,
      email,
      password,
      businessName,
    } = req.body;

    if (!role || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (role === "business" && !businessName) {
      return res.status(400).json({ message: "Business name is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userData = {
      username,
      role,
      firstName,
      lastName,
      email,
      passwordHash,
    };

    if (role === "business") {
      userData.businessName = businessName;
    }

    const user = new User(userData);
    await user.save();

    return res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login route (unchanged and working)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Both email and password are required." });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    if (user.role === "business") {
      userResponse.businessName = user.businessName;
    }

    return res.json({
      message: "Login successful!",
      token,
      user: userResponse,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "An error occurred during login." });
  }
});

module.exports = router;
