import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Advertisement.css';

const PlanYourTripPromo = () => {
  return (
    <section className="trip-promo">
      <motion.div 
        className="promo-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Ready to Explore Douala?</h2>
        <p>Plan your trip based on your budget and preferences, and discover the best hotels, restaurants, and attractions tailored just for you.</p>
        <Link to="/PlanTrip" className="promo-btn">
          Plan Your Trip
        </Link>
      </motion.div>
    </section>
  );
};

export default PlanYourTripPromo;
