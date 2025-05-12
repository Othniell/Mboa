import React from 'react';
import './TrendingActivities.css';

const TrendingActivities = () => {
  const activities = [
    {
      id: 1,
      name: "La Pagode Restaurant",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Fine Dining"
    },
    {
      id: 2,
      name: "Douala Maritime Museum",
      image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Cultural Experience"
    },
    {
      id: 3,
      name: "Bonanjo Night Market",
      image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Local Shopping"
    },
    {
      id: 4,
      name: "Wouri River Cruise",
      image: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Boat Tour"
    }
  ];

  return (
    <section className="trending-section">
      <div className="section-header">
        <h2>Trending Activities</h2>
        <p>Discover what's popular in Douala right now</p>
      </div>
      
      <div className="activities-grid">
        {activities.map((activity) => (
          <div className="activity-card" key={activity.id}>
            <div 
              className="card-image"
              style={{ backgroundImage: `url(${activity.image})` }}
            >
              <div className="card-overlay"></div>
              <h3 className="card-title">{activity.name}</h3>
            </div>
            <div className="card-footer">
              <span className="card-category">{activity.category}</span>
              <button className="card-button">Explore</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingActivities;