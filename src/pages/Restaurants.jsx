import { useState } from 'react';
import { FaSearch, FaFilter, FaStar, FaUtensils, FaMapMarkerAlt } from 'react-icons/fa';
import './Restaurants.css';

const Restaurants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [cuisineFilter, setCuisineFilter] = useState('all');

  // Sample restaurant data
  const restaurants = [
    {
      id: 1,
      name: "La Pagode",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      cuisine: "Asian Fusion",
      rating: 4.7,
      price: "$$$",
      location: "Bonanjo",
      delivery: true
    },
    {
      id: 2,
      name: "Le Wouri",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
      cuisine: "French",
      rating: 4.5,
      price: "$$",
      location: "Akwa",
      delivery: false
    },
    // Add 6 more restaurants...
        {
      id: 3,
      name: "La Pagode",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      cuisine: "Asian Fusion",
      rating: 4.7,
      price: "$$$",
      location: "Bonanjo",
      delivery: true
    },
    {
      id: 4,
      name: "Le Wouri",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
      cuisine: "French",
      rating: 4.5,
      price: "$$",
      location: "Akwa",
      delivery: false
    },

  ];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = priceFilter === 'all' || restaurant.price.length === priceFilter.length;
    const matchesCuisine = cuisineFilter === 'all' || restaurant.cuisine === cuisineFilter;
    
    return matchesSearch && matchesPrice && matchesCuisine;
  });

  return (
    <div className="restaurants-page">
      {/* Header Section */}
      <div className="restaurants-header">
        <h1>Restaurants in Douala</h1>
        <p>Discover the best dining experiences in the city</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-options">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
              <option value="all">All Prices</option>
              <option value="$">Budget ($)</option>
              <option value="$$">Moderate ($$)</option>
              <option value="$$$">Premium ($$$)</option>
            </select>
          </div>

          <div className="filter-group">
            <FaUtensils className="filter-icon" />
            <select value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)}>
              <option value="all">All Cuisines</option>
              <option value="Local">Local</option>
              <option value="Asian Fusion">Asian</option>
              <option value="French">French</option>
              <option value="International">International</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="restaurants-grid">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => (
            <div key={restaurant.id} className="restaurant-card">
              <div 
                className="restaurant-image"
                style={{ backgroundImage: `url(${restaurant.image})` }}
              >
                {restaurant.delivery && <span className="delivery-badge">Delivery Available</span>}
              </div>
              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <div className="restaurant-meta">
                  <span className="rating"><FaStar /> {restaurant.rating}</span>
                  <span className="price">{restaurant.price}</span>
                  <span className="cuisine">{restaurant.cuisine}</span>
                </div>
                <div className="restaurant-location">
                  <FaMapMarkerAlt /> {restaurant.location}
                </div>
                <button className="view-button">View Menu</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No restaurants match your filters. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;