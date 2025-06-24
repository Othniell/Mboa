// KeyInfo.jsx
import React from 'react';
import './KeyInfo.css';

const KeyInfo = ({ activity }) => {
  return (
    <div className="key-info">
      <div className="info-item">
        <strong>Category:</strong> {activity.category}
      </div>
      <div className="info-item">
        <strong>Location:</strong> {activity.location}
      </div>
      <div className="info-item">
        <strong>Average Rating:</strong> {activity.averageRating ? activity.averageRating.toFixed(1) : 'No ratings'}
      </div>
      <div className="info-item">
        <strong>Price:</strong> {activity.price ? `$${activity.price}` : 'Free'}
      </div>
      <div className="info-item">
        <strong>Opening Hours:</strong> {activity.openingHours || 'N/A'}
      </div>
    </div>
  );
};

export default KeyInfo;
