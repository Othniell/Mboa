const Location = require("../models/Location"); // make sure this exists

exports.saveLocation = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;

    if (!lat || !lng || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newLocation = new Location({ lat, lng, address });
    await newLocation.save();

    res.status(201).json({ message: "Location saved successfully", location: newLocation });
  } catch (error) {
    console.error("Error saving location:", error);
    res.status(500).json({ message: "Server error" });
  }
};
