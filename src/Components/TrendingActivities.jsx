import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './TrendingActivities.css';

const TrendingActivities = () => {
  const activities = [
    {
      id: 1,
      name: "Douala Maritime Museum",
      image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Cultural",
      rating: 4.5,
      reviews: 87,
      location: "Bonanjo, Douala"
    },
    {
      id: 2,
      name: "Manoka island",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Outdoor activity",
      rating: 4.8,
      reviews: 124,
      location: "Bonassama"
    },
    {
      id: 3,
      name: "Marché des Fleurs",
      image: "https://images.unsplash.com/photo-1588064637522-d3b69b1a45c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Market",
      rating: 4.3,
      reviews: 65,
      location: "Bonapriso, Douala"
    }
  ];

  return (
    <section className="trending-section">
      <div className="section-header">
        <h2>Trending in Douala</h2>
        <p>Top-rated places travelers love</p>
      </div>
      
      <div className="activities-grid">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
            className="activity-card-wrapper"
          >
            <Link to={`/activities/${activity.id}`} className="activity-card">
              <div 
                className="card-image"
                style={{ backgroundImage: `url(${activity.image})` }}
              >
                <div className="card-overlay">
                  <div className="card-content">
                    <div className="card-rating">
                      <FaStar className="star-icon" />
                      <span>{activity.rating}</span>
                      <span>({activity.reviews} reviews)</span>
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
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrendingActivities;