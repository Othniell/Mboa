const mongoose = require("mongoose");
const Review = require("../models/Review");
const Hotel = require("../models/Hotel");

const getHotelRatings = async (hotelId) => {
  const result = await Review.aggregate([
    { $match: { hotel: new mongoose.Types.ObjectId(hotelId) } },
    {
      $group: {
        _id: '$hotel',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { averageRating: 0, reviewCount: 0 };
};

const updateHotelRating = async (hotelId) => {
  const stats = await getHotelRatings(hotelId);
  await Hotel.findByIdAndUpdate(hotelId, {
    rating: stats.averageRating,
    reviewCount: stats.reviewCount
  });
};

module.exports = {
  getHotelRatings,
  updateHotelRating
};
