import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      {/* Search Bar Floating Above Hero */}
      <div className="floating-search">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search hotels, restaurants..." 
            className="search-input"
          />
          <button className="search-button">Search</button>
        </div>
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <h1>Welcome to</h1>
        <h2>DOUALA</h2>
      </div>
    </section>
  );
};

export default Hero;