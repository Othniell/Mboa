// ActivityHero.jsx
import React from 'react';
import './ActivityHero.css';

const ActivityHero = ({ activity }) => {
  return (
    <div className="activity-hero" style={{ backgroundImage: `url(${activity.images[0]})` }}>
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>{activity.name}</h1>
          <p>{activity.location}</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityHero;
