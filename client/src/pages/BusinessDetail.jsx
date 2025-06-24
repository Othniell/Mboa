import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import MapView from '../Components/MapView';
import TripAdvert from '../Components/TripAdverts';


const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/businesses/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch business data');
        const data = await response.json();
        setBusiness(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev === business.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? business.images.length - 1 : prev - 1));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!business) return <div className="not-found">Business not found</div>;

  const latitude = business.location?.lat || 4.0511;
  const longitude = business.location?.lng || 9.7679;

  return (
    <div className="business-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <IoIosArrowBack /> Back
      </button>

      <header className="business-header">
        <h1>{business.name}</h1>
        <div className="location">
          <FaMapMarkerAlt />
          <span>
            {business.location?.lat?.toFixed(4)}, {business.location?.lng?.toFixed(4)}
          </span>
        </div>
        {business.cuisine && (
          <p><strong>Cuisine:</strong> {business.cuisine}</p>
        )}
      </header>

      {business.images && business.images.length > 0 && (
        <div className="image-gallery">
          <div className="main-image">
            <img
              src={business.images[currentImageIndex]}
              alt={`${business.name} ${currentImageIndex + 1}`}
            />
            <button className="nav-button prev" onClick={prevImage}>‹</button>
            <button className="nav-button next" onClick={nextImage}>›</button>
          </div>
          <div className="thumbnail-grid">
            {business.images.map((img, idx) => (
              <div
                key={idx}
                className={`thumbnail-item ${idx === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(idx)}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="main-content">
        <div className="left-column">
          <div className="tabs">
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={activeTab === 'amenities' ? 'active' : ''}
              onClick={() => setActiveTab('amenities')}
            >
              Amenities
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview">
                <h2>About {business.name}</h2>
                <p>{business.description || "No description provided."}</p>
                {business.policies && business.policies.length > 0 && (
                  <div className="policies">
                    <h3>Policies</h3>
                    <ul>
                      {business.policies.map((policy, idx) => (
                        <li key={idx}>{policy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="amenities">
                <h2>Amenities</h2>
                {business.amenities && business.amenities.length > 0 ? (
                  <ul>
                    {business.amenities.map((amenity, idx) => (
                      <li key={idx}>{amenity}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No amenities listed.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="right-column">
          <div className="map-section">
            <h3>Location</h3>
            <MapView
              latitude={latitude}
              longitude={longitude}
              markerLabel={business.name}
              zoom={14}
            />
          </div>
          <TripAdvert />
        </aside>
      </div>
    </div>
  );
};

export default BusinessDetail;