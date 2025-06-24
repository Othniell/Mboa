import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TripAdvert.css';

const TripAdvert = () => {
  const navigate = useNavigate();

  return (
    <div className="trip-advert-section">
      <div className="trip-advert-content">
        <h2>Ready to plan your Douala adventure?</h2>
        <p>Customize your itinerary, discover top spots, and create unforgettable memories!</p>
        <button
          className="plan-trip-btn"
          onClick={() => navigate('/trip-planner')}
        >
          Plan Your Trip
        </button>
      </div>
    </div>
  );
};

export default TripAdvert;
