import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Hotels.css';

function Star({ filled }) {
  return (
    <svg
      height="20"
      width="20"
      fill={filled ? "#fbbf24" : "#e5e7eb"}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 .587l3.668 7.431L24 9.75l-6 5.851L19.335 24 12 20.201 4.665 24 6 15.601 0 9.75l8.332-1.732z" />
    </svg>
  );
}

export default function HotelsList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 300000,
    rating: 0,
    location: "",
    amenities: [],
  });

  useEffect(() => {
    async function fetchHotels() {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/business/hotels`);
        if (!response.ok) throw new Error("Failed to fetch hotels");
        const data = await response.json();
        setHotels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, []);

  function updateFilter(e) {
    const { name, value, type, checked } = e.target;
    if (name === "amenities") {
      setFilters((f) => {
        const newAmenities = checked
          ? [...f.amenities, value]
          : f.amenities.filter((a) => a !== value);
        return { ...f, amenities: newAmenities };
      });
    } else if (name === "rating") {
      setFilters((f) => ({ ...f, rating: Number(value) }));
    } else if (name === "location") {
      setFilters((f) => ({ ...f, location: value }));
    } else if (name === "minPrice" || name === "maxPrice") {
      setFilters((f) => ({ ...f, [name]: Number(value) }));
    }
  }

  const filteredHotels = hotels.filter((hotel) => {
    // Price filter
    if (hotel.pricePerNight < filters.minPrice || hotel.pricePerNight > filters.maxPrice)
      return false;

    // Rating filter
    if (filters.rating > 0 && hotel.averageRating < filters.rating) return false;

    // Amenities filter
    if (
      filters.amenities.length > 0 &&
      !(hotel.amenities && filters.amenities.every((a) => hotel.amenities.includes(a)))
    )
      return false;

    return true;
  });

  if (loading) return (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="hotel-page">
      <div
        className="hero"
        style={{
          backgroundImage: `url(${hotels[0]?.images?.[0] || "/uploads/hero.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay">
          <h1>Discover the Best Hotels</h1>
          <p>Find your perfect stay with great prices and amazing amenities.</p>
        </div>
      </div>

      <main className="main-content">
        <aside className="filters" aria-label="Hotel filters">
  <h2>Filters</h2>
  <div className="filter-group">
    <label>Price Range</label>
    <div className="range-inputs">
      <input
        type="number"
        name="minPrice"
        value={filters.minPrice}
        onChange={updateFilter}
        placeholder="Min"
        min={0}
      />
      <input
        type="number"
        name="maxPrice"
        value={filters.maxPrice}
        onChange={updateFilter}
        placeholder="Max"
        min={0}
      />
    </div>
  </div>

  <div className="filter-group">
    <label htmlFor="rating-select">Minimum Rating</label>
    <select
      id="rating-select"
      name="rating"
      value={filters.rating}
      onChange={updateFilter}
    >
      <option value={0}>Any</option>
      {[1, 2, 3, 4, 5].map((star) => (
        <option key={star} value={star}>
          {star} star{star > 1 ? "s" : ""}
        </option>
      ))}
    </select>
  </div>

  <div className="filter-group" aria-label="Amenities filter">
    <label>Amenities</label>
    <div className="checkboxes">
      {["WiFi", "Pool", "Spa", "Breakfast", "Parking"].map((amenity) => (
        <label key={amenity}>
          <input
            type="checkbox"
            name="amenities"
            value={amenity}
            checked={filters.amenities.includes(amenity)}
            onChange={updateFilter}
          />
          {amenity}
        </label>
      ))}
    </div>
  </div>
</aside>

        <section className="hotel-list">
          {filteredHotels.length === 0 ? (
            <div className="no-results">
              <h3>No hotels match your filters</h3>
              <button onClick={() => setFilters({
                minPrice: 0,
                maxPrice: 300000,
                rating: 0,
                location: "",
                amenities: [],
              })}>
                Clear all filters
              </button>
            </div>
          ) : (
            filteredHotels.map((hotel) => (
              // In your HotelsList component, update the hotel card section to:
<article className="hotel-card" key={hotel._id}>
  <Link to={`/hotels/${hotel._id}`} className="hotel-link">
    <div className="hotel-image">
      <img
        src={hotel.images?.[0] || "/uploads/default-hotel.jpg"}
        alt={hotel.name}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/uploads/default-hotel.jpg";
        }}
      />
      <div className="price-badge">
        {hotel.pricePerNight?.toLocaleString()} FCFA/night
      </div>
    </div>
    <div className="hotel-info">
      <h3>{hotel.name}</h3>
      <div className="rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} filled={i <= Math.round(hotel.averageRating || 0)} />
        ))}
        <span>({hotel.reviewsCount || 0} reviews)</span>
      </div>
      <p className="location">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        {hotel.location || "Unknown location"}
      </p>
      <p className="description">{hotel.description?.substring(0, 100)}...</p>
      <div className="amenities-tags">
        {hotel.amenities?.slice(0, 3).map((amenity) => (
          <span key={amenity} className="amenity-tag">{amenity}</span>
        ))}
        {hotel.amenities?.length > 3 && (
          <span className="amenity-tag">+{hotel.amenities.length - 3} more</span>
        )}
      </div>
    </div>
  </Link>
</article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}