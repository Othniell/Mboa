import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api'; // ou './api' selon ta config alias
import './Activities.css';

const categories = ["All", "Cultural", "Outdoor", "Market"];

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch activities from backend API via axios
    const fetchActivities = async () => {
      try {
        const response = await api.get('/api/activities');
        setActivities(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = selectedCategory === "All"
    ? activities
    : activities.filter(a => a.category === selectedCategory);

  if (loading) return <div>Loading activities...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h1 className="page-title">Things to Do in Douala</h1>

      <div className="filter-buttons">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="activities-grid">
        {filteredActivities.length === 0 ? (
          <p>No activities found.</p>
        ) : (
          filteredActivities.map(activity => (
            <Link to={`/activities/${activity._id}`} key={activity._id} className="activity-card">
              <div className="activity-images">
                {activity.images && activity.images.length > 0 ? (
                  <img
                    src={activity.images[0] || "https://via.placeholder.com/800x500?text=Activity"}
                    alt={activity.name}
                    className="activity-img"
                  />
                ) : (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${activity.image}`}
                    alt={activity.name}
                    className="activity-img"
                  />
                )}
              </div>
              <div className="activity-content">
                <h2 className="activity-name">{activity.name}</h2>
                <p className="activity-desc">{activity.description}</p>
                <small className="activity-location">{activity.location}</small>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
