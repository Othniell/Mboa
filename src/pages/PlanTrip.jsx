import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PlanTrip.css';
import TripMap from '../Components/TripMap';

const PlanYourTrip = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Category filters
  const [categories, setCategories] = useState({
    hotel: false,
    restaurant: false,
    activity: false,
  });

  // Price filters per category
  const [priceCategories, setPriceCategories] = useState({
    hotel: 'Luxury',
    restaurant: 'Luxury',
    activity: 'Luxury',
  });

  // All fetched results matching filters
  const [results, setResults] = useState([]);

  // User selected places from suggestions
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  // Errors
  const [error, setError] = useState('');

  // Categories to show on map/route
  const [mapCategories, setMapCategories] = useState({
    hotel: true,
    restaurant: true,
    activity: true,
  });

  // Voice guidance state
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const priceDescriptions = {
    Luxury:
      'Expect top-tier services, exclusive locations, and exceptional amenities. Prices are premium, with a focus on providing an unforgettable, high-end experience.',
    'Mid-range':
      'Enjoy a great balance of quality and value. Prices are moderate, offering comfort and good service without being too extravagant.',
    Economy:
      'Ideal for those looking to stretch their budget without sacrificing basic comfort. Prices are affordable and cater to those who want value for money.',
  };

  // Handlers
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

  const toggleMapCategory = (cat) => {
    setMapCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Toggle selection of a place in selectedPlaces
  const togglePlaceSelection = (place) => {
    setSelectedPlaces((prev) => {
      const exists = prev.find((p) => p._id === place._id);
      if (exists) {
        return prev.filter((p) => p._id !== place._id);
      } else {
        return [...prev, place];
      }
    });
  };

  // Check if a place is selected
  const isSelected = (place) => selectedPlaces.some((p) => p._id === place._id);

  // Fetch data from API based on filters
  const fetchData = async () => {
    try {
      if (!user) {
        setError('Please log in to plan your trip.');
        setResults([]);
        setSelectedPlaces([]);
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
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${endpoint}?priceCategory=${priceCategory}`);
          if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
          const data = await response.json();

          filteredResults = filteredResults.concat(
            data.filter((item) => item.priceCategory === priceCategory)
          );
        }
      }

      setResults(filteredResults);
      setError('');
      setSelectedPlaces([]); // Reset selected places on new fetch
    } catch (error) {
      setError('Error fetching data');
      console.error(error);
    }
  };

  useEffect(() => {
    if (categories.hotel || categories.restaurant || categories.activity) {
      fetchData();
    } else {
      setResults([]);
      setSelectedPlaces([]);
    }
  }, [categories, priceCategories]);

  // Save trip to localStorage
  const saveTrip = () => {
    try {
      localStorage.setItem(
        'savedTrip',
        JSON.stringify({ 
          categories, 
          priceCategories, 
          results, 
          selectedPlaces, 
          mapCategories,
          voiceEnabled 
        })
      );
      alert('Trip saved successfully!');
    } catch {
      alert('Failed to save trip.');
    }
  };

  // Load trip from localStorage
  const loadTrip = () => {
    try {
      const saved = localStorage.getItem('savedTrip');
      if (!saved) {
        alert('No saved trip found.');
        return;
      }
      const {
        categories: savedCategories,
        priceCategories: savedPrices,
        results: savedResults,
        selectedPlaces: savedSelected,
        mapCategories: savedMapCategories,
        voiceEnabled: savedVoiceEnabled
      } = JSON.parse(saved);

      setCategories(savedCategories);
      setPriceCategories(savedPrices);
      setResults(savedResults);
      setSelectedPlaces(savedSelected);
      setMapCategories(savedMapCategories);
      setVoiceEnabled(savedVoiceEnabled || false);
      alert('Trip loaded!');
    } catch {
      alert('Failed to load trip.');
    }
  };

  // Helper to get category of a place
  const getCategory = (place) => {
    if (place.rooms) return 'hotel';
    if (place.category) return 'activity';
    return 'restaurant';
  };

  // Filter selected places by mapCategories
  const filteredSelectedPlacesForMap = selectedPlaces.filter((place) =>
    mapCategories[getCategory(place)]
  );

  // Speak welcome message when voice is enabled
  useEffect(() => {
    if (voiceEnabled && selectedPlaces.length > 0) {
      const utterance = new SpeechSynthesisUtterance(
        "Voice guidance enabled. You have selected " + 
        selectedPlaces.length + 
        " destinations. Enable the itinerary to begin navigation."
      );
      window.speechSynthesis.speak(utterance);
    }
  }, [voiceEnabled, selectedPlaces]);

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
          {['hotel', 'restaurant', 'activity'].map((type) => (
            <div key={type}>
              <label>
                <input
                  type="checkbox"
                  name={type}
                  checked={categories[type]}
                  onChange={handleCategoryChange}
                />{' '}
                {type.charAt(0).toUpperCase() + type.slice(1)}
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
        {error && (
          <p className="error-message" style={{ color: 'red' }}>
            {error}
          </p>
        )}
      </div>

      {results.length > 0 && (
        <>
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
                    <p className="result-rating">
                      ⭐ {item.averageRating || 0} | {item.priceCategory}
                    </p>
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

                    {/* Selection checkbox */}
                    <label style={{ marginTop: '0.5rem', display: 'block' }}>
                      <input
                        type="checkbox"
                        checked={isSelected(item)}
                        onChange={() => togglePlaceSelection(item)}
                      />{' '}
                      Add to trip
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map category toggles */}
          <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            <h3>Select Categories to Show on Map and Route</h3>
            {['hotel', 'restaurant', 'activity'].map((cat) => (
              <label key={cat} style={{ marginRight: 15 }}>
                <input
                  type="checkbox"
                  checked={mapCategories[cat]}
                  onChange={() => toggleMapCategory(cat)}
                />{' '}
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </label>
            ))}
          </div>

          {/* Voice toggle */}
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <label>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Enable Voice Guidance
            </label>
          </div>

          {/* Save / Load buttons */}
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <button
              onClick={saveTrip}
              disabled={selectedPlaces.length === 0}
              title={selectedPlaces.length === 0 ? 'Select places to save trip' : ''}
            >
              Save Trip
            </button>
            <button onClick={loadTrip} style={{ marginLeft: '10px' }}>
              Load Trip
            </button>
          </div>

          {/* Trip Map */}
          <div className="trip-map-section">
            <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Your Trip Map</h2>
            {selectedPlaces.length > 0 ? (
              <TripMap places={filteredSelectedPlacesForMap} voiceEnabled={voiceEnabled} />
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>
                Select places above to see them on the map.
              </p>
            )}
          </div>
        </>
      )}

      {!error && results.length === 0 && (
        <div className="empty-message">
          <p>Start by selecting what you'd like to plan!</p>
        </div>
      )}
    </div>
  );
};

export default PlanYourTrip;