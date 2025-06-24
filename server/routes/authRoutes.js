const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const upload = require("../config/multer");
const jwt = require("jsonwebtoken");

// Load your secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "Mondenouvaux12";


// Use multer middleware for files with field names 'businessImages' and 'businessDocs'
const cpUpload = upload.fields([
  { name: "businessImages", maxCount: 5 },
  { name: "businessDocs", maxCount: 5 },
]);

// Signup route
router.post("/signup", cpUpload, async (req, res) => {
  try {
    const {
      username,
      role,
      firstName,
      lastName,
      email,
      password,   // <--- here, get raw password from user
      businessName,
    } = req.body;

    // Simple validation
    if (!role || !firstName || !lastName || !email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    if (role === "business" && !businessName) {
      return res.status(400).json({ message: "Business name is required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = {
      username,
      role,
      firstName,
      lastName,
      email,
      passwordHash,
    };

    // ...rest of your code...


    if (role === "business") {
      userData.businessName = businessName;
      // Store file paths
      if (req.files["businessImages"]) {
        userData.businessImages = req.files["businessImages"].map(
          (file) => file.path
        );
      }
      if (req.files["businessDocs"]) {
        userData.businessDocs = req.files["businessDocs"].map(
          (file) => file.path
        );
      }
    }

    // Create user
    const user = new User(userData);
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input more thoroughly
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Both email and password are required." 
      });
    }

    // Find user with email and ensure passwordHash exists
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      return res.status(400).json({ 
        message: "Invalid email or password." 
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ 
        message: "Invalid email or password." 
      });
    }

    // Build token payload
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    // Sign token
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "your_consistent_secret_here",
      { expiresIn: "1d" }
    );

    // ✅ Return user data with username
    const userResponse = {
      id: user._id,
      username: user.username,              // ✅ Now included
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
    return res.status(500).json({ 
      message: "An error occurred during login. Please try again." 
    });
  }
});

module.exports = router;
