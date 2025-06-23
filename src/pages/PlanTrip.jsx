import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PlanTrip.css';
import TripMap from '../Components/TripMap'; // adjust path if needed



const PlanYourTrip = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState({
    hotel: false,
    restaurant: false,
    activity: false,
  });

  const [priceCategories, setPriceCategories] = useState({
    hotel: 'Luxury',
    restaurant: 'Luxury',
    activity: 'Luxury',
  });

  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const priceDescriptions = {
    "Luxury": "Expect top-tier services, exclusive locations, and exceptional amenities. Prices are premium, with a focus on providing an unforgettable, high-end experience.",
    "Mid-range": "Enjoy a great balance of quality and value. Prices are moderate, offering comfort and good service without being too extravagant.",
    "Economy": "Ideal for those looking to stretch their budget without sacrificing basic comfort. Prices are affordable and cater to those who want value for money."
  };

  const handleCategoryChange = (e) => {
    setCategories({
      ...categories,
      [e.target.name]: e.target.checked,
    });
  };

  const handlePriceCategoryChange = (e, category) => {
    setPriceCategories({
      ...priceCategories,
      [category]: e.target.value,
    });
  };

  const fetchData = async () => {
    try {
      if (!user) {
        setError('Please log in to plan your trip.');
        setResults([]);
        return;
      }

      let filteredResults = [];
      const endpointMap = {
        hotel: 'hotels',
        restaurant: 'restaurants',
        activity: 'activities',
      };

      for (const key of Object.keys(categories)) {
        if (categories[key]) {
          const endpoint = endpointMap[key];
          const priceCategory = priceCategories[key];
          const response = await fetch(`http://localhost:5000/api/${endpoint}?priceCategory=${priceCategory}`);
          if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
          const data = await response.json();

          filteredResults = filteredResults.concat(
            data.filter(item => item.priceCategory === priceCategory)
          );
        }
      }

      setResults(filteredResults);
      setError('');

    } catch (error) {
      setError('Error fetching data');
      console.error(error);
    }
  };

  useEffect(() => {
    if (categories.hotel || categories.restaurant || categories.activity) {
      fetchData();
    }
  }, [categories, priceCategories]);

return (
    <div className="plan-trip-page">
      <div className="hero-section">
        <div className="hero-overlay">
          <h1>Plan Your Dream Trip</h1>
          <p>Discover amazing places to eat, sleep and explore in Douala!</p>
        </div>
      </div>

      <div className="trip-form">
        {/* Category checkboxes + price selection */}
        <div className="category-options">
          {['hotel', 'restaurant', 'activity'].map(type => (
            <div key={type}>
              <label>
                <input
                  type="checkbox"
                  name={type}
                  checked={categories[type]}
                  onChange={handleCategoryChange}
                /> {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
              {categories[type] && (
                <div className="price-category">
                  <label>Select Price Category:</label>
                  <select
                    id={`priceCategory-${type}`}
                    value={priceCategories[type]}
                    onChange={(e) => handlePriceCategoryChange(e, type)}
                  >
                    <option value="Luxury">Luxury</option>
                    <option value="Mid-range">Mid-range</option>
                    <option value="Economy">Economy</option>
                  </select>
                  <div className="price-description">
                    <p>{priceDescriptions[priceCategories[type]]}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={fetchData}>Show Suggestions</button>
        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      </div>

      {results.length > 0 ? (
        <>
          {/* Suggestions */}
          <div className="trip-results">
            <h2>Your Tailored Suggestions</h2>
            <div className="result-grid">
              {results.map((item) => (
                <div className="result-card" key={item._id}>
                  <div
                    className="result-image"
                    style={{ backgroundImage: `url(${item.image || item.images?.[0]})` }}
                  ></div>
                  <div className="result-info">
                    <h3>{item.name}</h3>
                    <p className="result-location">📍 {item.location || item.address}</p>
                    <p className="result-rating">⭐ {item.averageRating || 0} | {item.priceCategory}</p>
                    <p className="result-description">{item.description}</p>
                    <button
                      className="view-btn"
                      onClick={() => {
                        const type = item.rooms ? 'hotels' : item.category ? 'activities' : 'restaurants';
                        navigate(`/${type}/${item._id}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ Trip Map */}
          <div className="trip-map-section">
            <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Your Trip Map</h2>
            <TripMap places={results} />
          </div>
        </>
      ) : (
        !error && (
          <div className="empty-message">
            <p>Start by selecting what you'd like to plan!</p>
          </div>
        )
      )}
    </div>
  );
};

export default PlanYourTrip;
