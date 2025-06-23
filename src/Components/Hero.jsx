import React, { useState, useEffect } from 'react';
import './Hero.css';

// Image imports (replace with your actual images)
import image1 from './../assets/images/Nouvelle-Liberte.jpg';
import image2 from './../assets/images/Nouvelle-Liberte.jpg';
import image3 from './../assets/images/Nouvelle-Liberte.jpg';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [image1, image2, image3];
  const texts = [
    "Discover Vibrant Culture",
    "Explore Stunning Beaches",
    "Experience Lively Nightlife"
  ];

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="hero">
      {/* Image Carousel */}
      <div className="carousel">
        {images.map((img, index) => (
          <div 
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          >
            <div className="gradient-overlay"></div>
          </div>
        ))}
      </div>

      {/* Hero Text */}
      <div className="hero-content">
        <div className="text-container">
          <h1 className="welcome-text">WELCOME TO</h1>
          <h2 className="city-name">DOUALA</h2>
          <p className="tagline">{texts[currentSlide]}</p>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="indicators">
        {images.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;