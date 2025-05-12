import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section">
          <h3 className="footer-heading">Mboardiscovery</h3>
          <p className="footer-about">
            Discover the best of Douala with our curated selection of hotels, restaurants, and activities.
          </p>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">Hotels</a></li>
            <li><a href="#">Restaurants</a></li>
            <li><a href="#">Activities</a></li>
            <li><a href="#">About Us</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3 className="footer-heading">Contact Us</h3>
          <ul className="contact-info">
            <li>
              <FaMapMarkerAlt className="contact-icon" />
              <span>123 Bonanjo, Douala, Cameroon</span>
            </li>
            <li>
              <FaPhone className="contact-icon" />
              <span>+237 6XX XXX XXX</span>
            </li>
            <li>
              <FaEnvelope className="contact-icon" />
              <span>contact@mboardiscovery.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright">
        <p>&copy; {new Date().getFullYear()} Mboardiscovery. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;