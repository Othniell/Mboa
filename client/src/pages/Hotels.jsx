import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Hotels.css";

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
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 300,
    rating: 0,
    location: "",
    amenities: [],
  });

  useEffect(() => {
    async function fetchHotels() {
      try {
        const response = await fetch("http://localhost:5000/api/hotels");
        if (!response.ok) throw new Error("Failed to fetch hotels");
        const data = await response.json();
        setHotels(data);
        console.log("Hotels data:", data);
      } catch (err) {
        setError(err.message);
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
    if (hotel.price < filters.minPrice || hotel.price > filters.maxPrice) return false;

    const reviewsCount = hotel.reviews?.length || 0;
    const averageRating = reviewsCount
      ? hotel.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount
      : 0;

    if (filters.rating > 0 && averageRating < filters.rating) return false;
    if (filters.location && hotel.location !== filters.location) return false;

    if (
      filters.amenities.length > 0 &&
      !(hotel.amenities && filters.amenities.every((a) => hotel.amenities.includes(a)))
    )
      return false;

    return true;
  });

  if (error) return <p>Error: {error}</p>;
  if (!hotels.length) return <p>Loading hotels...</p>;

  return (
    <div className="hotel-page">
      <div
        className="hero"
        style={{
          backgroundImage: `url(${
            hotels[0]?.heroImage || "http://localhost:5000/uploads/hero.jpg"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          position: "relative",
        }}
      >
        <div className="hero-content">
          <h1>Discover the Best Hotels in Douala</h1>
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

          <div className="filter-group">
            <label htmlFor="location-select">Location</label>
            <select
              id="location-select"
              name="location"
              value={filters.location}
              onChange={updateFilter}
            >
              <option value="">Any</option>
              <option value="Akwa">Akwa</option>
              <option value="Bonanjo">Bonanjo</option>
              <option value="Mountains">Mountains</option>
            </select>
          </div>

          <div className="filter-group" aria-label="Amenities filter">
            <label>Amenities</label>
            <div className="checkboxes">
              {["WiFi", "Pool", "Spa", "Shuttle", "Breakfast", "Parking"].map((amenity) => (
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

        <section className="hotel-list" aria-live="polite">
          {filteredHotels.length === 0 ? (
            <p>No hotels found.</p>
          ) : (
            filteredHotels.map((hotel) => {
              const reviewsCount = hotel.reviews?.length || 0;
              const averageRating = reviewsCount
                ? hotel.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
                : 0;

              return (
                <article className="hotel-card" key={hotel._id || hotel.id}>
                  <Link
                    to={`/hotels/${hotel._id || hotel.id}`}
                    className="hotel-link"
                  >
                    <img
                      src={hotel.images?.[0] || hotel.image || ""}
                      alt={hotel.name}
                      loading="lazy"
                    />
                    <div className="info">
                      <h3>{hotel.name}</h3>
                      <div
                        className="rating"
                        aria-label={`${averageRating.toFixed(1)} star rating`}
                      >
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} filled={i <= Math.round(averageRating)} />
                        ))}
                        <span>
                          ({reviewsCount} review{reviewsCount !== 1 ? "s" : ""})
                        </span>
                      </div>
                      <p>{hotel.description}</p>
                      <div className="tags">
                        {hotel.amenities?.length > 0 &&
                          hotel.amenities.map((a) => <span key={a}>{a}</span>)}
                      </div>
                      <p className="price-category">
                        <strong>Category:</strong> {hotel.priceCategory || "N/A"}
                      </p>
                      <div className="bottom-row">
                        <strong>${hotel.price}/night</strong>
                        <button
                          className="book-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Booking hotel: ${hotel.name}`);
                          }}
                          aria-label={`Book ${hotel.name} now`}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
