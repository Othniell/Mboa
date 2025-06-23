import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";
import RestaurantMapPage from "../Components/RestaurantMap";
import TripAdvert from "../Components/TripAdverts";
import "./RestaurantDetail.css";

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    comment: "",
    rating: 0,
    hoveredStar: 0,
    images: [],
    imageFiles: [],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/restaurants/${id}`);
        const data = await res.json();
        setRestaurant(data);
      } catch (err) {
        setError("Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/reviews/restaurant/${id}`);
        const data = await res.json();
        console.log("Fetched Reviews:", data); // 👈 Add this
        setReviews(data);
        console.log("Reviews fetched:", data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [id]);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === restaurant.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? restaurant.images.length - 1 : prev - 1
    );
  };

  const handleStarClick = (value) => setForm({ ...form, rating: value });
  const handleHover = (value) => setForm({ ...form, hoveredStar: value });
  const handleHoverOut = () => setForm({ ...form, hoveredStar: 0 });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith("image/"));
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...previews],
      imageFiles: [...prev.imageFiles, ...validFiles],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !token) {
      alert("You must be logged in to submit a review.");
      return;
    }

    if (!form.comment.trim() || !form.rating) {
      alert("Comment and rating required");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("comment", form.comment);
      formData.append("rating", form.rating);
      formData.append("restaurantId", id);
      formData.append("user", user._id);

      form.imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const newReview = await res.json();
      setReviews((prev) => [...prev, newReview]);

      setForm({
        comment: "",
        rating: 0,
        hoveredStar: 0,
        images: [],
        imageFiles: [],
      });

      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Review submission error:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="restaurant-detail">
      <h1>{restaurant.name}</h1>

      {/* ⭐ Average Rating Display */}
      {averageRating ? (
        <div className="average-rating-display">
          <div className="stars-row">
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar
                key={s}
                color={s <= Math.round(averageRating) ? "#facc15" : "#ddd"}
                size={20}
              />
            ))}
            <span className="rating-number">
              {averageRating} / 5 ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
      ) : (
        <p className="no-rating-text">No ratings yet</p>
      )}

      {/* 🖼️ Image Grid */}
      <div className="image-gallery">
        <div className="main-image">
          <img
            src={restaurant.images?.[currentImageIndex] || "/placeholder.jpg"}
            alt="Main"
          />
          <button className="nav-button prev" onClick={prevImage}>‹</button>
          <button className="nav-button next" onClick={nextImage}>›</button>
        </div>
        <div className="thumbnail-grid">
          {restaurant.images?.map((img, index) => (
            <div
              key={index}
              className={`thumbnail-item ${index === currentImageIndex ? "active" : ""}`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* 📋 Restaurant Info */}
      <div className="restaurant-info">
        <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
        <p><strong>Price:</strong> {restaurant.price}</p>
        <p><strong>Location:</strong> {restaurant.location?.address || "Unknown"}</p>
        <p>{restaurant.description}</p>
      </div>

      {/* ✍️ Review Form */}
      <section className="review-form">
        <h2>Write a Review</h2>
        <form onSubmit={handleSubmit}>
          <label>Comment</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            required
          />
          <label>Rating</label>
          <div onMouseLeave={handleHoverOut}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`star ${(form.hoveredStar || form.rating) >= star ? "filled" : ""}`}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleHover(star)}
              />
            ))}
          </div>
          <label>Upload Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          <div className="preview-images">
            {form.images.map((src, i) => (
              <img key={i} src={src} alt={`Preview ${i}`} />
            ))}
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </section>

      {/* 📣 Reviews List */}
      <section className="reviews">
        <h2>Reviews</h2>
        {reviews.length === 0 && <p>No reviews yet.</p>}
        {reviews.map((r, i) => (
          <div key={i} className="review-card">
            <p><strong>{r.user && r.user.username ? r.user.username : "Anonymous"}</strong></p>
            <p>{r.comment}</p>
            <p>
              {[...Array(5)].map((_, j) => (
                <FaStar key={j} color={j < r.rating ? "#facc15" : "#ddd"} />
              ))}
            </p>
            {r.images?.length > 0 && (
              <div className="review-images">
                {r.images.map((img, j) => (
                  <img key={j} src={img} alt={`Review image ${j + 1}`} />
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      <RestaurantMapPage location={restaurant.location} />
      <TripAdvert />
    </div>
  );
};

export default RestaurantDetail;
