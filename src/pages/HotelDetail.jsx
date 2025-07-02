import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUser, FaCamera } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import './HotelDetail.css';
import MapView from "../Components/MapView";
import TripAdvert from '../Components/TripAdverts';

function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    images: []
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/hotels/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch hotel data');
        const data = await response.json();
        setHotel(data);
        setReviews(data.reviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id, submitSuccess]);

  useEffect(() => {
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      setAverageRating(Number(avgRating.toFixed(1)));
    }
  }, [reviews]);

  const handleBookNow = async () => {
    if (!checkIn || !checkOut) return alert("Select dates");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/hotels/${hotel._id}/book`, {
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    setError('');

    try {
      // Validate files
      const validFiles = files.filter(file => {
        const isValidType = file.type.match('image.*');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        return isValidType && isValidSize;
      });

      if (validFiles.length === 0) {
        throw new Error('Please select valid images (JPEG/PNG under 5MB)');
      }

      if (validFiles.length !== files.length) {
        setError('Some files were skipped (must be images <5MB)');
      }

      // Create previews
      const previewUrls = validFiles.map(file => URL.createObjectURL(file));
      setReviewForm(prev => ({
        ...prev,
        images: [...prev.images, ...previewUrls]
      }));

      // Upload to server
      const uploadPromises = validFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload image ${index + 1}`);
        }

        return await response.json();
      });

      const uploadResults = await Promise.all(uploadPromises);
      const uploadedUrls = uploadResults.map(result => result.imageUrl).filter(url => url);
      
      // Replace previews with permanent URLs
      setReviewForm(prev => ({
        ...prev,
        images: [
          ...prev.images.filter(img => !previewUrls.includes(img)),
          ...uploadedUrls
        ]
      }));

      if (uploadedUrls.length < validFiles.length) {
        setError(`Uploaded ${uploadedUrls.length} of ${validFiles.length} images`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Image upload failed. You can still submit your review without images.');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index) => {
    // Revoke object URL if it's a local preview
    if (reviewForm.images[index].startsWith('blob:')) {
      URL.revokeObjectURL(reviewForm.images[index]);
    }
    
    setReviewForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      reviewForm.images.forEach(image => {
        if (image.startsWith('blob:')) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [reviewForm.images]);

  const validateForm = () => {
    const errors = {};
    if (reviewForm.rating === 0) errors.rating = 'Please select a rating';
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

      // Filter out any local blob URLs before submission
      const submittedImages = reviewForm.images.filter(img => !img.startsWith('blob:'));

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hotelId: hotel._id,
          comment: reviewForm.comment,
          rating: Number(reviewForm.rating),
          images: submittedImages
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to submit review");
      }

      // Clear form on success
      setReviewForm({ rating: 0, comment: '', images: [] });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
      setError(null);
      
    } catch (error) {
      console.error("Submit review failed:", error.message);
      setError(error.message);
    }
  };

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
  if (error && !hotel) return <div className="error">Error: {error}</div>;
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
              <FaStar key={i} className={i < averageRating ? 'filled' : ''} />
            ))}
          </div>
          <span>{averageRating || 0} ({hotel.reviews?.length || 0} reviews)</span>
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
                      <div className="review-name"><FaUser /> {review.name || 'Anonymous'}</div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? 'filled' : ''} />
                        ))}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="review-images">
                        {review.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Review ${index + 1}`} className="review-image" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <form className="review-form" onSubmit={handleSubmitReview}>
                  <h3>Submit Your Review</h3>
                  {submitSuccess && (
                    <div className="success-message">
                      Review submitted successfully!
                    </div>
                  )}
                  
                  {error && (
                    <div className="error-message">
                      {error}
                      <button 
                        onClick={() => setError('')}
                        className="dismiss-error"
                      >
                        ×
                      </button>
                    </div>
                  )}

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
                  {formErrors.rating && <div className="form-error">{formErrors.rating}</div>}

                  <textarea 
                    name="comment" 
                    placeholder="Share your experience..." 
                    value={reviewForm.comment} 
                    onChange={handleInputChange} 
                    rows="5"
                  />
                  {formErrors.comment && <div className="form-error">{formErrors.comment}</div>}

                  <div className="image-upload-section">
                    <label className="upload-button">
                      <FaCamera /> Add Photos
                      <input 
                        type="file" 
                        multiple 
                        accept="image/jpeg, image/png, image/webp" 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                        disabled={imageUploading}
                      />
                    </label>
                    
                    {imageUploading && (
                      <div className="upload-status">
                        <div className="upload-spinner"></div>
                        <span>Uploading {reviewForm.images.filter(img => img.startsWith('blob:')).length} image(s)...</span>
                      </div>
                    )}
                    
                    <div className="upload-requirements">
                      <small>Max 5MB per image (JPEG, PNG, WEBP)</small>
                    </div>

                    <div className="image-preview">
                      {reviewForm.images.map((img, index) => (
                        <div key={index} className="preview-item">
                          <img 
                            src={img} 
                            alt={`Preview ${index}`} 
                            className={img.startsWith('blob:') ? 'upload-pending' : ''}
                          />
                          <button 
                            type="button" 
                            className="remove-image" 
                            onClick={() => removeImage(index)}
                            disabled={imageUploading}
                          >
                            ×
                          </button>
                          {img.startsWith('blob:') && (
                            <div className="upload-progress">Uploading...</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-review-btn"
                    disabled={imageUploading}
                  >
                    {imageUploading ? 'Processing...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <aside className="right-column">
          <div className="booking-widget">
            <h3>Book Your Stay</h3>
            {bookingSuccess && <div className="success-message">Booking successful!</div>}
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
        </aside>
      </div>
    </div>
  );
}

export default HotelDetail;