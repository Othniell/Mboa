require("dotenv").config(); // 👈 Always put this at the top!

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const restaurantRoutes = require("./routes/restaurantRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const activityRoutes = require("./routes/activityRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const tripRoutes = require("./routes/tripRoutes");
const locationRoute = require('./routes/location');
const businessRoute = require("./routes/businessRoute");
const adminRoute = require("./routes/adminRoute");

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/location", locationRoute);
app.use("/api/business", businessRoute);
app.use("/api/admin", adminRoute);

// Static folders
app.use('/uploads', express.static('uploads'));
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.get("/", (req, res) => {
  res.send("Tourism API is running...");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running on port", process.env.PORT || 5000);
    });
  })
  .catch((err) => console.error("❌ DB connection failed", err));
