import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Advertisement.css';

const Advertisement = () => {
  const navigate = useNavigate();

  const handlePlanTripClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      navigate("/PlanTrip");
    }
  };

  return (
    <section className="trip-promo">
      <motion.div 
        className="promo-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Ready to Explore Douala?</h2>
        <p>
          Plan your trip based on your budget and preferences, and discover the best hotels,
          restaurants, and attractions tailored just for you.
        </p>
        <button 
          onClick={handlePlanTripClick} 
          className="promo-btn"
        >
          Plan Your Trip
        </button>
      </motion.div>
    </section>
  );
};

export default Advertisement;
