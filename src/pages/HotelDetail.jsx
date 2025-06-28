import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import './HotelDetail.css';
import MapView from "../Components/MapView";
import TripAdvert from '../Components/TripAdverts';

function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 0,
    title: '',
    comment: '',
    email: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/hotels/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch hotel data');
        const data = await response.json();
        setHotel(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id, submitSuccess]);

  const handleBookNow = async () => {
    if (!checkIn || !checkOut) return alert("Select dates");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/hotels/${hotel._id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomName: "Standard Room",
          checkIn,
          checkOut,
          guests,
          totalPrice: hotel.pricePerNight * guests,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Booking failed");
      }

      await response.json();
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 4000);
    } catch (err) {
      alert(`Booking error: ${err.message}`);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex(prev =>
      prev === hotel.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev =>
      prev === 0 ? hotel.images.length - 1 : prev - 1
    );
  };

  const handleRatingClick = (rating) => {
    setReviewForm({ ...reviewForm, rating });
  };

  const handleRatingHover = (rating) => {
    setHoverRating(rating);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({ ...reviewForm, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!reviewForm.name) errors.name = 'Name is required';
    if (!reviewForm.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewForm.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (reviewForm.rating === 0) errors.rating = 'Please select a rating';
    if (!reviewForm.title) errors.title = 'Title is required';
    if (!reviewForm.comment) errors.comment = 'Review text is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to submit a review');
        return;
      }

      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hotelId: hotel._id,
          name: reviewForm.name,
          email: reviewForm.email,
          title: reviewForm.title,
          comment: reviewForm.comment,
          rating: Number(reviewForm.rating),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to submit review");
      }

      await response.json();
      setReviewForm({ name: '', email: '', title: '', comment: '', rating: 0 });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
      setError(null);
    } catch (error) {
      console.error("Submit review failed:", error.message);
      setError(error.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!hotel) return <div className="not-found">Hotel not found</div>;

  const latitude = hotel.locationCoords?.latitude || 4.0511;
  const longitude = hotel.locationCoords?.longitude || 9.7679;

  return (
    <div className="hotel-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <IoIosArrowBack /> Back to results
      </button>

      <header className="hotel-header">
        <h1>{hotel.name}</h1>
        <div className="hotel-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < hotel.rating ? 'filled' : ''} />
            ))}
          </div>
          <span>{hotel.rating} ({hotel.reviews?.length || 0} reviews)</span>
        </div>
        <div className="location">
          <FaMapMarkerAlt />
          <span>{hotel.address}, {hotel.location}</span>
        </div>
      </header>

      <div className="image-gallery">
        <div className="main-image">
          <img
            src={hotel.images[currentImageIndex]}
            alt={`${hotel.name} ${currentImageIndex + 1}`}
          />
          <button className="nav-button prev" onClick={prevImage}>‹</button>
          <button className="nav-button next" onClick={nextImage}>›</button>
        </div>
        <div className="thumbnail-grid">
          {hotel.images.map((img, index) => (
            <div 
              key={index}
              className={`thumbnail-item ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        <div className="left-column">
          <div className="tabs">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={activeTab === 'amenities' ? 'active' : ''} onClick={() => setActiveTab('amenities')}>Amenities</button>
            <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews ({hotel.reviews?.length || 0})</button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview">
                <h2>About {hotel.name}</h2>
                <p>{hotel.description}</p>

                {/* Moved Map below description */}
                
                  <h3>Location</h3>
                  <MapView
                    latitude={latitude}
                    longitude={longitude}
                    markerLabel={hotel.name}
                    zoom={hotel.locationType === 'city' ? 14 : 12}
                  />
                
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="amenities">
                <h2>Amenities</h2>
                <ul>
                  {hotel.amenities?.map((amenity, idx) => (
                    <li key={idx}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews">
                <h2>Customer Reviews</h2>
                {hotel.reviews?.length === 0 && <p>No reviews yet.</p>}
                {hotel.reviews?.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <div className="review-name"><FaUser /> {review.name}</div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? 'filled' : ''} />
                        ))}
                      </div>
                    </div>
                    <div className="review-title">{review.title}</div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}

                <form className="review-form" onSubmit={handleSubmitReview}>
                  <h3>Submit Your Review</h3>
                  {submitSuccess && <p className="success-message">Review submitted successfully!</p>}
                  {error && <p className="error-message">{error}</p>}

                  <input type="text" name="name" placeholder="Your Name" value={reviewForm.name} onChange={handleInputChange} />
                  {formErrors.name && <p className="form-error">{formErrors.name}</p>}

                  <input type="email" name="email" placeholder="Your Email" value={reviewForm.email} onChange={handleInputChange} />
                  {formErrors.email && <p className="form-error">{formErrors.email}</p>}

                  <input type="text" name="title" placeholder="Review Title" value={reviewForm.title} onChange={handleInputChange} />
                  {formErrors.title && <p className="form-error">{formErrors.title}</p>}

                  <textarea name="comment" placeholder="Your Review" value={reviewForm.comment} onChange={handleInputChange} />
                  {formErrors.comment && <p className="form-error">{formErrors.comment}</p>}

                  <div className="rating-input">
                    {[...Array(5)].map((_, i) => {
                      const ratingValue = i + 1;
                      return (
                        <FaStar
                          key={i}
                          className={(hoverRating || reviewForm.rating) >= ratingValue ? 'filled' : ''}
                          onClick={() => handleRatingClick(ratingValue)}
                          onMouseEnter={() => handleRatingHover(ratingValue)}
                          onMouseLeave={handleRatingLeave}
                        />
                      );
                    })}
                  </div>
                  {formErrors.rating && <p className="form-error">{formErrors.rating}</p>}

                  <button type="submit">Submit Review</button>
                </form>
              </div>
            )}
          </div>
        </div>

        <aside className="right-column">
          <div className="booking-widget">
            <h3>Book Your Stay</h3>
            {bookingSuccess && <p className="success-message">Booking successful!</p>}
            <label>
              Check-in:
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </label>
            <label>
              Check-out:
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </label>
            <label>
              Guests:
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </label>
            <button onClick={handleBookNow}>Book Now</button>
          </div>
          <TripAdvert />
          {/* Removed Map from here */}
        </aside>
      </div>
    </div>
  );
}

export default HotelDetail;
