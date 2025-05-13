import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaSearch, FaFilter, FaStar, FaUtensils, FaMapMarkerAlt, FaHeart, FaRegHeart, FaBicycle } from 'react-icons/fa';
import './Restaurants.css';

const RestaurantsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);

  // Restaurant data (same as before)
  const restaurants = [
    {
      id: 1,
      name: "La Pagode",
      mainImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      cuisine: "Asian Fusion",
      rating: 4.7,
      price: "$$$",
      location: "Bonanjo",
      delivery: true,
      new: true,
      reviews: 128,
      features: ["Delivery", "Open Now", "Reservations", "Outdoor Seating"],
    },
    // ... other restaurants
  ];

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = priceFilter === 'all' || restaurant.price.length === priceFilter.length;
    const matchesCuisine = cuisineFilter === 'all' || restaurant.cuisine === cuisineFilter;
    
    return matchesSearch && matchesPrice && matchesCuisine;
  });

  const openRestaurantPage = (id) => {
    navigate(`/restaurants/${id}`);
  };

  return (
    <div className="restaurants-page">
      {/* Hero Header */}
      <div className="restaurant-hero">
        <div className="hero-content">
          <h1>Discover Douala's Finest Dining</h1>
          <p>Explore {restaurants.length}+ exceptional restaurants curated just for you</p>
          <div className="hero-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Find restaurants by name, cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group price-filter">
          <label>
            <FaFilter className="filter-icon" />
            Price
          </label>
          <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="$">$ Budget</option>
            <option value="$$">$$ Moderate</option>
            <option value="$$$">$$$ Premium</option>
          </select>
        </div>

        <div className="filter-group cuisine-filter">
          <label>
            <FaUtensils className="filter-icon" />
            Cuisine
          </label>
          <select value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="Local">Local</option>
            <option value="Asian Fusion">Asian</option>
            <option value="French">French</option>
            <option value="International">International</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} found
      </div>

      {/* Restaurant List View */}
      <div className="restaurants-list">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => (
            <div 
              key={restaurant.id} 
              className="restaurant-item"
              onClick={() => openRestaurantPage(restaurant.id)}
            >
              <div className="image-carousel">
                <img 
                  src={restaurant.mainImage} 
                  alt={restaurant.name}
                  className="restaurant-image"
                />
                
                <button 
                  className={`favorite-btn ${favorites.includes(restaurant.id) ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(restaurant.id, e)}
                >
                  {favorites.includes(restaurant.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
                
                {restaurant.new && <span className="new-badge">NEW</span>}
              </div>

              <div className="restaurant-info">
                <div className="info-header">
                  <h3>{restaurant.name}</h3>
                  <div className="rating-container">
                    <div className="rating">
                      <FaStar className="star-icon" />
                      <span>{restaurant.rating}</span>
                      <span className="review-count">({restaurant.reviews} reviews)</span>
                    </div>
                    <span className="price">{restaurant.price}</span>
                  </div>
                </div>

                <div className="cuisine-location">
                  <span className="cuisine">{restaurant.cuisine}</span>
                  <span className="location">
                    <FaMapMarkerAlt /> {restaurant.location}
                  </span>
                </div>

                <div className="features">
                  {restaurant.features.map((feature, index) => (
                    <span key={index} className="feature">
                      {feature.includes("Delivery") && <FaBicycle />}
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="action-buttons">
                  <button className="open-now-btn">
                    {restaurant.features.includes("Open Now") ? "Open Now" : "Closed"}
                  </button>
                  <button className="menu-btn">View Menu</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <img src="/images/no-results.svg" alt="No results found" />
            <h3>No restaurants match your search</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsList;