const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// 1. Configure storage destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder where images will be saved
  },
  filename: function (req, file, cb) {
    // create a unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // preserve original extension
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Initialize multer with storage config
const upload = multer({ storage: storage });

// 3. Make 'uploads' folder accessible statically
app.use('/uploads', express.static('uploads'));

// 4. Define an upload route
app.post('/api/hotels/:hotelId/images', upload.array('images', 10), (req, res) => {
  // req.files contains array of uploaded files
  const files = req.files;

  if (!files) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  // Create array of URLs for each uploaded image
  const imageUrls = files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);

  // TODO: Update your MongoDB hotel document with new image URLs
  // e.g., Hotel.findByIdAndUpdate(req.params.hotelId, { $push: { images: { $each: imageUrls } } })

  return res.json({ message: 'Images uploaded successfully', imageUrls });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
