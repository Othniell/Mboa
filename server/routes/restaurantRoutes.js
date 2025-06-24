const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");
const upload = require("../config/multer");

// Create Restaurant with image uploads
router.post("/", upload.array("restaurantImages", 5), async (req, res) => {
  try {
    const { name, description, location, priceCategory } = req.body;
    const images = req.files.map((file) => file.path);

    // Validate priceCategory
    if (!['Luxury', 'Mid-range', 'Economy'].includes(priceCategory)) {
      return res.status(400).json({ error: 'Invalid price category' });
    }

    // Create restaurant with the validated priceCategory
    const restaurant = await Restaurant.create({
      name,
      description,
      location,
      priceCategory,  // Add priceCategory to the restaurant
      images,
    });

    res.status(201).json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// GET all restaurants with optional priceCategory filtering
router.get("/", async (req, res) => {
  try {
    const { priceCategory } = req.query;

    // If priceCategory is provided, filter the restaurants by priceCategory
    const filter = priceCategory && priceCategory !== 'all' ? { priceCategory } : {};

    // Fetch the filtered list of restaurants from the database
    const restaurants = await Restaurant.find(filter);
    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET a single restaurant by ID
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
