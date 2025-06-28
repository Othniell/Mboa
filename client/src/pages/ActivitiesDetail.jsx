import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";
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

  // ✅ Fetch Activity (with avg. rating & count)
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

      // ✅ Refetch activity to update avg rating
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

  if (loading) return <p className="text-center py-10">Loading activity...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!activity) return <p>Activity not found.</p>;

  return (
    <div className="activity-detail">
      <button className="back-button" onClick={() => navigate(-1)}>
        <IoIosArrowBack /> Back to results
      </button>

      <div className="overview">
  <h1>{activity.name}</h1>

  <div className="star-rating-display">
    {[1, 2, 3, 4, 5].map((star) => {
      let color = "#d1d5db"; // Default color for empty stars

      if (star <= Math.floor(activity.averageRating)) {
        // Full stars
        color = "#facc15";
      } else if (star <= Math.ceil(activity.averageRating) && activity.averageRating % 1 !== 0) {
        // Half stars
        color = "#facc15"; // For half, we'll color it in full yellow
      }

      return (
        <FaStar
          key={star}
          size={18}
          color={color}
          style={star <= Math.floor(activity.averageRating) ? { color: "#facc15" } : {}}
        />
      );
    })}
    <span style={{ marginLeft: "8px" }}>
      {activity.averageRating} ({activity.reviewCount} reviews)
    </span>
  </div>
</div>


      {/* image gallery */}
      <div className="image-grid-container">
        <div className="main-image-box">
          <img
            src={activity.images?.[currentImageIndex] || "https://via.placeholder.com/800x500?text=Activity"}
            alt={`Main image ${currentImageIndex + 1}`}
            className="main-image"
          />
          <button className="nav-button prev" onClick={prevImage}>‹</button>
          <button className="nav-button next" onClick={nextImage}>›</button>
        </div>
        <div className="thumbnail-row">
          {activity.images?.map((img, idx) => (
            <div key={idx} className={`thumbnail-item ${idx === currentImageIndex ? "active" : ""}`} onClick={() => setCurrentImageIndex(idx)}>
              <img src={img} alt={`Thumbnail ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="overview">
        <div className="location">
          <FaMapMarkerAlt /> {activity.location?.address || "Location not available"}
        </div>
        <p>{activity.description}</p>
      </div>

      {/* Reviews */}
      <section className="review-section">
        <h2>Reviews</h2>
        <button onClick={() => setShowReviewForm(!showReviewForm)} className="write-review-button">
          {showReviewForm ? "Cancel" : "Write a Review"}
        </button>

        {showReviewForm && (
          <form className="review-form" onSubmit={handleSubmit}>
            <textarea
              placeholder="Share your experience..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              required
            />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="image-upload-input"
            />
            <div className="star-rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={24}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarHoverOut}
                  color={star <= (form.hoveredStar || form.stars) ? "#facc15" : "#d1d5db"}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        <div className="reviews-list">
          {reviews.length === 0 && <p className="no-reviews">No reviews yet.</p>}
          {reviews.map((r) => (
            <div key={r._id} className="review-card">
              <div className="review-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar key={s} color={s <= r.rating ? "#facc15" : "#d1d5db"} />
                ))}
              </div>
              <p className="review-comment">{r.comment}</p>
              {r.images?.length > 0 && (
                <div className="review-images">
                  {r.images.map((img, i) => (
                    <img key={i} src={img} alt={`review-${i}`} className="review-image" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Map section */}
      <section className="map-section">
        <h2>Location Map</h2>
        <MapContainer
          center={[activity.latitude, activity.longitude]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={[activity.latitude, activity.longitude]} icon={activityIcon}>
            <Popup>
              <div style={{ textAlign: "center" }}>
                <strong>{activity.name}</strong>
                {userPosition && (
                  <button onClick={() => setShowRoute(!showRoute)} className="map-btn">
                    {showRoute ? "Hide Itinerary" : "Show Itinerary"}
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
            <Routing userPosition={userPosition} destination={{ lat: activity.latitude, lng: activity.longitude }} />
          )}
        </MapContainer>
      </section>

      <TripAdvert />
    </div>
  );
};

export default ActivityDetail;
