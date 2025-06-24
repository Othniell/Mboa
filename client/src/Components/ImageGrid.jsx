import React from 'react';
import './ImageGrid.css';

const BACKEND_URL = "http://localhost:5000"; // or your production URL

const ImageGrid = ({ images }) => {
  if (!images || images.length === 0) return null;

  const mainImage = images[0];
  const otherImages = images.slice(1, 5); // Limit to 5 images max

  return (
    <div className="image-grid">
      <div className="main-image">
        <img src={`${BACKEND_URL}/${mainImage}`} alt="Main" />
      </div>
      <div className="side-images">
        {otherImages.map((img, index) => (
          <div key={index} className="side-image">
            <img src={`${BACKEND_URL}/${img}`} alt={`Image ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
