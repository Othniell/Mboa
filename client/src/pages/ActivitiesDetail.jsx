import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaMapMarkerAlt, FaRegStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import TripAdvert from '../Components/TripAdverts';
import activityIconImg from "../assets/images/epingler.png";
import { useAuth } from "../context/AuthContext";
import "./ActivitiesDetail.css";

const activityIcon = L.icon({
  iconUrl: activityIconImg,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -30],
});

function Routing({ userPosition, destination }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map || !userPosition || !destination) return;

    if (routingRef.current) map.removeControl(routingRef.current);

    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userPosition.lat, userPosition.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      lineOptions: { styles: [{ color: "#007bff", weight: 5 }] },
    }).addTo(map);

    return () => {
      if (routingRef.current) map.removeControl(routingRef.current);
    };
  }, [map, userPosition, destination]);

  return null;
}

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [form, setForm] = useState({
    comment: "",
    stars: 0,
    hoveredStar: 0,
    images: [],
    imageFiles: [],
  });

  const fetchActivity = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/activities/${id}`);
      if (!res.ok) throw new Error("Failed to load activity");
      const data = await res.json();
      setActivity(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [id]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews/activity/${id}`)
      .then((res) => res.json())
      .then(setReviews)
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserPosition(null),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleUserMarkerDragEnd = (e) => {
    const position = e.target.getLatLng();
    setUserPosition({ lat: position.lat, lng: position.lng });
  };

  const handleStarClick = (star) => setForm({ ...form, stars: star });
  const handleStarHover = (star) => setForm({ ...form, hoveredStar: star });
  const handleStarHoverOut = () => setForm({ ...form, hoveredStar: 0 });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setForm({
      ...form,
      images: [...form.images, ...previews],
      imageFiles: [...form.imageFiles, ...files],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) return alert("You must be logged in to submit a review.");
    if (!form.comment || !form.stars) return alert("Please provide a comment and a rating.");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("comment", form.comment);
      formData.append("rating", form.stars);
      formData.append("activityId", id);
      form.imageFiles.forEach((file) => formData.append("images", file));

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit review");

      const newReview = await res.json();
      setReviews((prev) => [...prev, newReview]);
      form.images.forEach((url) => URL.revokeObjectURL(url));
      setForm({ comment: "", stars: 0, hoveredStar: 0, images: [], imageFiles: [] });
      setShowReviewForm(false);
      await fetchActivity();
    } catch (err) {
      alert("Failed to submit review. Please try again.", err);
    } finally {
      setSubmitting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === activity.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? activity.images.length - 1 : prev - 1
    );
  };

  if (loading) return (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);
  if (error) return <div className="error-container"><p>{error}</p></div>;
  if (!activity) return <div className="not-found-container"><p>Activity not found.</p></div>;

  return (
    <div className="activity-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <IoIosArrowBack /> Back to results
      </button>

      <div className="activity-header">
        <h1 className="activity-title">{activity.name}</h1>
        
        <div className="activity-meta">
          <div className="rating-container">
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {star <= activity.averageRating ? (
                    <FaStar className="star-filled" />
                  ) : (
                    <FaRegStar className="star-empty" />
                  )}
                </span>
              ))}
            </div>
            <span className="rating-text">
              {activity.averageRating.toFixed(1)} ({activity.reviewCount} reviews)
            </span>
          </div>
          
          <div className="location-info">
            <FaMapMarkerAlt className="location-icon" />
            <span>{activity.location?.address || "Location not available"}</span>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
  {/* Image Gallery */}
<div className="image-gallery">
  <div className="main-image-container">
    {activity.images?.length > 0 ? (
      <img
        src={activity.images[currentImageIndex]}
        alt={`Main view of ${activity.name}`}
        className="main-image"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/800x500?text=Activity+Image";
        }}
      />
    ) : (
      <div className="no-image-placeholder">
        <span>No images available</span>
      </div>
    )}
    
    {activity.images?.length > 1 && (
      <>
        <button className="nav-button prev" onClick={prevImage} aria-label="Previous image">
          <FaChevronLeft />
        </button>
        <button className="nav-button next" onClick={nextImage} aria-label="Next image">
          <FaChevronRight />
        </button>
        
        <div className="image-counter">
          {currentImageIndex + 1} / {activity.images.length}
        </div>
      </>
    )}
  </div>
  
  {activity.images?.length > 1 && (
    <div className="thumbnail-container">
      {activity.images.map((img, idx) => (
        <div
          key={idx}
          className={`thumbnail ${idx === currentImageIndex ? "active" : ""}`}
          onClick={() => setCurrentImageIndex(idx)}
          aria-label={`View image ${idx + 1}`}
        >
          <img 
            src={img} 
            alt={`Thumbnail ${idx + 1}`} 
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/100x75?text=Thumbnail";
            }}
          />
        </div>
      ))}
    </div>
  )}
</div>

      <div className="activity-content">
        <section className="description-section">
          <h2 className="section-title">About this activity</h2>
          <p className="description-text">{activity.description}</p>
        </section>

        {/* Reviews Section */}
        <section className="reviews-section">
          <div className="section-header">
            <h2 className="section-title">Customer Reviews</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="review-button"
            >
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          </div>

          {showReviewForm && (
            <form className="review-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="comment">Your Review</label>
                <textarea
                  id="comment"
                  placeholder="Share your experience..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Rating</label>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarHoverOut}
                      className={`star ${star <= (form.hoveredStar || form.stars) ? "active" : ""}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="images">Upload Photos (Optional)</label>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-upload"
                />
                {form.images.length > 0 && (
                  <div className="image-previews">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="image-preview">
                        <img src={img} alt={`Preview ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button type="submit" className="submit-button" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="review-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={star <= review.rating ? "filled" : "empty"}
                        />
                      ))}
                    </div>
                    <div className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="review-content">{review.comment}</p>
                  
                  {review.images?.length > 0 && (
                    <div className="review-images">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="review-image">
                          <img src={img} alt={`Review ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Map Section */}
        <section className="map-section">
          <h2 className="section-title">Location</h2>
          <div className="map-container">
            <MapContainer
              center={[activity.latitude, activity.longitude]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%", borderRadius: "8px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[activity.latitude, activity.longitude]} icon={activityIcon}>
                <Popup>
                  <div className="map-popup">
                    <strong>{activity.name}</strong>
                    {userPosition && (
                      <button
                        onClick={() => setShowRoute(!showRoute)}
                        className="route-button"
                      >
                        {showRoute ? "Hide Route" : "Show Route"}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>

              {userPosition && (
                <Marker
                  position={[userPosition.lat, userPosition.lng]}
                  draggable={true}
                  eventHandlers={{ dragend: handleUserMarkerDragEnd }}
                >
                  <Popup>Your location (drag to update)</Popup>
                </Marker>
              )}

              {userPosition && showRoute && (
                <Routing
                  userPosition={userPosition}
                  destination={{ lat: activity.latitude, lng: activity.longitude }}
                />
              )}
            </MapContainer>
          </div>
        </section>
      </div>

      <TripAdvert />
    </div>
  );
};

export default ActivityDetail;