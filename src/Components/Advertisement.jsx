import React from 'react';
import './Advertisement.css';

const Advertisement = () => {
  return (
    <div className="ad-card">
      <div className="ad-content">
        <h2>Discover Hidden Gems</h2>
        <p>Explore exclusive local experiences in Douala</p>
        <button className="ad-button">Learn More</button>
      </div>
    </div>
  );
};

export default Advertisement;