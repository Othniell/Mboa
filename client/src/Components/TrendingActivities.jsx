import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './TrendingActivities.css';

const TrendingActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/activities/trending`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Server responded with ${response.status}`
          );
        }

        const data = await response.json();
        setActivities(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingActivities();
  }, []);

  const handleCardClick = (activityId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      navigate(`/activities/${activityId}`);
    }
  };

  if (loading) {
    return (
      <section className="trending-section">
        <div className="section-header">
          <h2>Trending in Douala</h2>
          <p>Top-rated places travelers love</p>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="trending-section">
        <div className="section-header">
          <h2>Trending in Douala</h2>
          <p>Top-rated places travelers love</p>
        </div>
        <div className="error-message">
          Error loading trending activities: {error}
        </div>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section className="trending-section">
        <div className="section-header">
          <h2>Trending in Douala</h2>
          <p>Top-rated places travelers love</p>
        </div>
        <div className="no-activities">
          No trending activities found at the moment.
        </div>
      </section>
    );
  }

  return (
    <section className="trending-section">
      <div className="section-header">
        <h2>Trending in Douala</h2>
        <p>Top-rated places travelers love</p>
      </div>
      
      <div className="activities-grid">
        {activities.map((activity, index) => (
          <motion.div
            key={activity._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
            className="activity-card-wrapper"
            onClick={() => handleCardClick(activity._id)}
          >
            <div className="activity-card">
              <div 
                className="card-image"
                style={{ 
                  backgroundImage: `url(${activity.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'})` 
                }}
              >
                <div className="card-overlay">
                  <div className="card-content">
                    <div className="card-rating">
                      <FaStar className="star-icon" />
                      <span>{activity.averageRating || 0}</span>
                      <span>({activity.reviewCount || 0} reviews)</span>
                    </div>
                    <h3>{activity.name}</h3>
                    <div className="card-meta">
                      <span className="card-category">{activity.category}</span>
                      <div className="card-location">
                        <FaMapMarkerAlt />
                        <span>{activity.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrendingActivities;
