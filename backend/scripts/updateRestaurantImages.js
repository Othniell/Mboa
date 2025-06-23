const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('../models/Restaurant'); // Adjust path if needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://othnielmoube45:5jAHjUi3pYFtRbD3@cluster-1.9ypiwqi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-1';

const seedRestaurants = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    // Clear existing restaurants (optional)
    await Restaurant.deleteMany({});

    // Create some sample restaurants with image arrays
    const restaurants = [
      {
        name: "Le Patio",
        description: "Cozy garden restaurant",
        mainImage : "http://localhost:5000/uploads/restautantImages/lepatio.jpg",
        rating : 4.5,
        reviews : 124,
        price : "$$",
        cuisine : "Grill",
        location: "Bonapriso Douala",
        latitude: 4.028651054133677,
        longitude: "9.698873795024731",
        images: [
          "/uploads/restaurantImages/lepatio1.jpg",
          "/uploads/restaurantImages/lepatio2.jpg",
          "/uploads/restaurantImages/lepatio3.jpg"
        ],
        averageRating: 4.5,
        reviews: [],
        features : [ ]
      },
       {
        name: "La vigna restaurant",
        description: "Cozy garden restaurant",
        mainImage : "http://localhost:5000/uploads/restautantImages/lepatio.jpg",
        rating : 4.5,
        reviews : 124,
        price : "$",
        cuisine : "Mediterrain",
        location: "Bonapriso Douala",
        latitude: 4.021618546767339,
        longitude: "9.69965873735345",
        images: [
          "/uploads/restaurantImages/lepatio1.jpg",
          "/uploads/restaurantImages/lepatio2.jpg",
          "/uploads/restaurantImages/lepatio3.jpg"
        ],
        averageRating: 4.5,
        reviews: [],
        features : [ ]
      },
       {
        name: "Le Patio",
        description: "Cozy garden restaurant",
        mainImage : "http://localhost:5000/uploads/restautantImages/lepatio.jpg",
        rating : 4.5,
        reviews : 124,
        price : "$$",
        cuisine : "fast food",
        location: "Bali Douala",
        latitude: "4.037154331379139",
        longitude: "9.690549579682205",
        images: [
          "/uploads/restaurantImages/lepatio1.jpg",
          "/uploads/restaurantImages/lepatio2.jpg",
          "/uploads/restaurantImages/lepatio3.jpg"
        ],
        averageRating: 4.5,
        reviews: [],
        features : [ ]
      },
       {
        name: "le vault",
        description: "Cozy garden restaurant",
        mainImage : "http://localhost:5000/uploads/restautantImages/lepatio.jpg",
        rating : 4.5,
        reviews : 124,
        price : "$$",
        cuisine : "grill",
        location: "Bonamoussadi Douala",
        latitude: "4.051233728390143",
        longitude: "9.767812495024865",
        images: [
          "/uploads/restaurantImages/lepatio1.jpg",
          "/uploads/restaurantImages/lepatio2.jpg",
          "/uploads/restaurantImages/lepatio3.jpg"
        ],
        averageRating: 4.5,
        reviews: [],
        features : [ ]
      },
       {
        name: "Kotcha restaurant",
        description: "Cozy garden restaurant",
        mainImage : "http://localhost:5000/uploads/restautantImages/lepatio.jpg",
        rating : 4.5,
        reviews : 124,
        price : "$$",
        location: "Bonanjo Douala",
        latitude: "4.046502230142354",
        longitude: "9.6884442635544",
        images: [
          "/uploads/restaurantImages/lepatio1.jpg",
          "/uploads/restaurantImages/lepatio2.jpg",
          "/uploads/restaurantImages/lepatio3.jpg"
        ],
        averageRating: 4.5,
        reviews: [],
        features : [ ]
      },

      // Add more if you want
    ];

    await Restaurant.insertMany(restaurants);

    console.log("Restaurants seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding restaurants:", error);
    process.exit(1);
  }
};

seedRestaurants();
