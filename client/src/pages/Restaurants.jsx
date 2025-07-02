import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaStar, FaUtensils, FaMapMarkerAlt, FaHeart, FaRegHeart, FaBicycle
} from 'react-icons/fa';
import './Restaurants.css';

const RestaurantsList = () => {
  const navigate = useNavigate();

  const [priceFilter, setPriceFilter] = useState('all');  // Price filter state
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch restaurants from backend, considering the price filter
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants`, {
          params: {
            priceCategory: priceFilter === 'all' ? undefined : priceFilter,  // Pass priceFilter as query param
          }
        });
        const restaurantData = res.data;

        // Fetch reviews and calculate average ratings
        const updatedData = await Promise.all(
          restaurantData.map(async (r) => {
            try {
              const reviewRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/reviews/restaurant/${r._id}`);
              const reviews = reviewRes.data;
              const avgRating = reviews.length
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : null;
              return { ...r, reviewCount: reviews.length, averageRating: avgRating };
            } catch (err) {
              return { ...r, reviewCount: 0, averageRating: null };
            }
          })
        );

        setRestaurants(updatedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [priceFilter]);  // Refetch restaurants whenever priceFilter changes

  // Handle toggling restaurant favorites
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter restaurants based on price and cuisine
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesPrice = priceFilter === 'all' || restaurant.priceCategory === priceFilter;
    const matchesCuisine = cuisineFilter === 'all' || restaurant.cuisine === cuisineFilter;
    return matchesPrice && matchesCuisine;
  });

  const openRestaurantPage = (id) => {
    navigate(`/restaurants/${id}`);
  };

  // Loading and error handling
if (loading) return (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);
  if (error) return <p>Error: {error}</p>;

  // Unique price categories and cuisines for dropdowns
  const uniquePrices = ['all', 'Luxury', 'Mid-range', 'Economy', ...new Set(restaurants.map(r => r.priceCategory).filter(Boolean))];
  const uniqueCuisines = ['all', ...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];

  return (
    <div className="restaurants-page">
      <div className="restaurant-hero">
        <div className="hero-content">
          <h1>Discover Douala's Finest Dining</h1>
          <p>Explore {restaurants.length}+ exceptional restaurants curated just for you</p>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <label>Price:</label>
          <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
            {uniquePrices.map(price => (
              <option key={price} value={price}>
                {price === 'all' ? 'All' : price}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Cuisine:</label>
          <select value={cuisineFilter} onChange={e => setCuisineFilter(e.target.value)}>
            {uniqueCuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>
                {cuisine === 'all' ? 'All' : cuisine}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Updated Pricing Legend */}
      <div className="pricing-legend">
        <strong>💡 Pricing Legend:</strong>
        <ul>
          <li><span>Luxury</span> Premium Dining Experience</li>
          <li><span>Mid-range</span> Affordable & Comfortable</li>
          <li><span>Economy</span> Budget-Friendly</li>
        </ul>
      </div>

      <div className="results-count">
        {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} found
      </div>

      <div className="restaurants-list">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => (
            <div
              key={restaurant._id}
              className="restaurant-item"
              onClick={() => openRestaurantPage(restaurant._id)}
            >
              <div className="image-carousel">
                <img
                  src={restaurant.images?.[0] || restaurant.mainImage || 'https://via.placeholder.com/400x300?text=Restaurant+Image'}
                  alt={restaurant.name || 'Restaurant Image'}
                  className="restaurant-image"
                  loading="lazy"
                />
                <button
                  className={`favorite-btn ${favorites.includes(restaurant._id) ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(restaurant._id, e)}
                  aria-label={favorites.includes(restaurant._id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.includes(restaurant._id) ? <FaHeart /> : <FaRegHeart />}
                </button>
                {restaurant.isNew && <span className="new-badge">NEW</span>}
              </div>

              <div className="restaurant-info">
                <div className="info-header">
                  <h3>{restaurant.name}</h3>
                  <div className="rating-container">
                    <div className="rating">
                      <FaStar className="star-icon" />
                      <span>{restaurant.averageRating || 'N/A'}</span>
                      <span className="review-count">
                        ({restaurant.reviewCount || 0} reviews)
                      </span>
                    </div>
                    <span className="price">{restaurant.priceCategory || '-'}</span>
                  </div>
                </div>

                <div className="cuisine-location">
                  <span className="cuisine">
                    <FaUtensils /> {restaurant.cuisine || 'Unknown'}
                  </span>
                  <span className="location">
                    <FaMapMarkerAlt /> {restaurant.location || 'Unknown'}
                  </span>
                </div>

                <div className="features">
                  {restaurant.features?.map((feature, index) => (
                    <span key={index} className="feature">
                      {feature.includes("Delivery") && <FaBicycle />} {feature}
                    </span>
                  ))}
                </div>

                <div className="action-buttons">
                  <button className="open-now-btn">
                    {restaurant.features?.includes("Open Now") ? "Open Now" : "Closed"}
                  </button>
                  <button
                    className="menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Menu feature coming soon!');
                    }}
                  >
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <img
              src="/images/no-results.svg"
              alt="No results found"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=No+Results+Found';
              }}
            />
            <h3>No restaurants match your filters</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsList;
