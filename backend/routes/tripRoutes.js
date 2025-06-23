const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const { protect }  = require("../middleware/authMiddleware");

// Create a trip
router.post("/", protect, async (req, res) => {
  try {
    const trip = await Trip.create({ ...req.body, user: req.user._id });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all trips for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single trip
router.get("/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: "Trip not found or unauthorized" });
    }
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a trip
router.delete("/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: "Trip not found or unauthorized" });
    }
    await trip.remove();
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
