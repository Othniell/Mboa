import { useState } from 'react';
import { FaStar, FaUserCircle, FaHeart, FaRegHeart } from 'react-icons/fa';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
  const [activeTab, setActiveTab] = useState('mains');
  const [isFavorite, setIsFavorite] = useState(false);

  const [reviews, setReviews] = useState([
    { user: 'Alex Johnson', rating: 5, date: '2 days ago', comment: 'The carbonara was divine! Service was impeccable.' },
    { user: 'Sam Wilson', rating: 4, date: '1 week ago', comment: 'Great ambiance, but the tiramisu was a bit too sweet.' },
  ]);

  const [newReview, setNewReview] = useState({ user: '', rating: 5, comment: '' });

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newEntry = {
      ...newReview,
      date: formattedDate
    };

    setReviews([newEntry, ...reviews]);
    setNewReview({ user: '', rating: 5, comment: '' });
  };

  const ratingSummary = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }));

  const restaurant = {
    name: "Gourmet Delight",
    cuisine: "Italian • Fine Dining",
    rating: 4.7,
    description: "Award-winning Italian cuisine with a modern twist. Fresh ingredients sourced locally.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
  };

  const menuItems = {
    starters: [
      { name: 'Truffle Bruschetta', price: '$12', description: 'Toasted bread with truffle oil and tomatoes' },
      { name: 'Calamari', price: '$14', description: 'Crispy squid with lemon aioli' },
    ],
    mains: [
      { name: 'Pasta Carbonara', price: '$18', description: 'Classic spaghetti with creamy egg sauce and pancetta' },
      { name: 'Risotto ai Funghi', price: '$22', description: 'Creamy mushroom risotto with parmesan' },
    ],
    desserts: [
      { name: 'Tiramisu', price: '$10', description: 'Espresso-soaked ladyfingers with mascarpone' },
      { name: 'Panna Cotta', price: '$9', description: 'Vanilla custard with berry coulis' },
    ],
  };

  return (
    <div className="restaurant-detail">
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: `url(${restaurant.image})` }}>
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>{restaurant.name}</h1>
            <div className="hero-subtitle">
              <span>{restaurant.cuisine}</span>
              <span className="rating">⭐ {restaurant.rating} (120+ reviews)</span>
            </div>
            <p>{restaurant.description}</p>
            <button
              className="favorite-btn"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
              {isFavorite ? ' Saved' : ' Save to Favorites'}
            </button>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="menu-section">
        <h2>Menu</h2>
        <div className="menu-tabs">
          {['starters', 'mains', 'desserts'].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="menu-items">
          {menuItems[activeTab].map((item, index) => (
            <div key={index} className="menu-item">
              <div className="item-text">
                <h3>{item.name}</h3>
                <p className="item-description">{item.description}</p>
              </div>
              <span className="item-price">{item.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Review Summary Section */}
      <section className="summary-section">
        <h2>Rating Summary</h2>
        <div className="summary-board">
          {ratingSummary.map(({ star, count }) => (
            <div key={star} className="summary-row">
              <span className="star-label">{star} ★</span>
              <div className="bar-wrapper">
                <div className="bar" style={{ width: `${(count / reviews.length) * 100}%` }}></div>
              </div>
              <span className="count">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Add Review Form */}
      <section className="review-form-section">
        <h2>Add a Review</h2>
        <form className="review-form" onSubmit={handleAddReview}>
          <input
            type="text"
            name="user"
            placeholder="Your name"
            value={newReview.user}
            onChange={handleReviewChange}
            required
          />
          <select name="rating" value={newReview.rating} onChange={handleReviewChange}>
            {[5, 4, 3, 2, 1].map(r => (
              <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
            ))}
          </select>
          <textarea
            name="comment"
            placeholder="Write your review..."
            value={newReview.comment}
            onChange={handleReviewChange}
            required
          />
          <button type="submit" className="submit-review-btn">Submit</button>
        </form>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <h2>Reviews</h2>
        <div className="reviews-list">
          {reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">
                <FaUserCircle size={32} className="user-avatar" />
                <div className="review-meta">
                  <h4>{review.user}</h4>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} color={i < review.rating ? '#FFD700' : '#DDDDDD'} />
                    ))}
                  </div>
                </div>
                <small className="review-date">{review.date}</small>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <h2>Location</h2>
        <iframe
          title="Restaurant Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215209179423!2d-73.98784492452578!3d40.74844097138989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1712345678901!5m2!1sen!2sus"
          width="100%"
          height="400"
          style={{ border: 0, borderRadius: '8px' }}
          allowFullScreen
          loading="lazy"
        />
      </section>
    </div>
  );
};

export default RestaurantDetail;
