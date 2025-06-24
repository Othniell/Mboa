const express = require('express');
const router = express.Router();

// Dummy location data
router.get('/', (req, res) => {
  res.json({
    latitude: 4.0503,
    longitude: 9.7679,
    label: 'Douala City Center',
  });
});

module.exports = router;
