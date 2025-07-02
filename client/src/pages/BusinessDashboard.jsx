import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { FiUpload, FiMapPin, FiInfo, FiHome, FiCoffee, FiActivity } from "react-icons/fi";
import "./BusinessDashboard.css";
// Updated fields map without latitude and longitude inputs
const fieldMap = {
  hotel: [
    { name: "name", label: "Hotel Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "address", label: "Address", type: "text" },
    { name: "contact", label: "Contact", type: "text" },
    { name: "pricePerNight", label: "Price Per Night", type: "number" },
    { name: "priceCategory", label: "Price Category", type: "select", options: ["Luxury", "Mid-range", "Economy"] },
    { name: "policies", label: "Policies (comma-separated)", type: "text" },
    { name: "amenities", label: "Amenities (comma-separated)", type: "text" },
    { name: "images", label: "Images", type: "file", multiple: true },
  ],
  restaurant: [
    { name: "name", label: "Restaurant Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "address", label: "Address", type: "text" },
    { name: "cuisine", label: "Cuisine", type: "text" },
    { name: "price", label: "Average Price", type: "number" },
    { name: "priceCategory", label: "Price Category", type: "select", options: ["Luxury", "Mid-range", "Economy"] },
    { name: "images", label: "Images", type: "file", multiple: true },
  ],
  activity: [
    { name: "name", label: "Activity Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "address", label: "Location Name", type: "text" },
    { name: "category", label: "Category", type: "text" },
    { name: "priceCategory", label: "Price Category", type: "select", options: ["Luxury", "Mid-range", "Economy"] },
    { name: "images", label: "Images", type: "file", multiple: true },
  ],
};

// Custom MapView to handle draggable marker
const MapView = ({ setLatLng, latLng }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLatLng({ lat, lng });
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return (
    <Marker
      position={latLng}
      draggable
      onDragend={(e) => {
        const { lat, lng } = e.target.getLatLng();
        setLatLng({ lat, lng });
      }}
    >
      <Popup>{`Latitude: ${latLng.lat}, Longitude: ${latLng.lng}`}</Popup>
    </Marker>
  );
};

const BusinessDashboard = () => {
  const [type, setType] = useState("hotel");
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [latLng, setLatLng] = useState({ lat: 4.0511, lng: 9.7679 }); // Default position

  const fields = fieldMap[type];

  const handleChange = (e) => {
    const { name, value, type: inputType, files } = e.target;
    if (inputType === "file") {
      setImages(files);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("type", type);

      for (const key in formData) {
        payload.append(key, formData[key]);
      }

      for (const file of images) {
        payload.append("images", file);
      }

      // Handle location as nested fields
      payload.append("location.address", formData.address || "");
      payload.append("location.lat", latLng.lat);
      payload.append("location.lng", latLng.lng);

      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/business/create`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      toast.success(`✅ Business created!\n📧 Email sent to ${formData.email}`);
      setFormData({});
      setImages([]);
      setLatLng({ lat: 4.0511, lng: 9.7679 });
    } catch (err) {
      toast.error("❌ Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="business-dashboard">
      <div className="dashboard-header">
        <h1>Register Your Business</h1>
        <p>Fill in the details to list your business on our platform</p>
      </div>

      <div className="business-form-container">
        <div className="form-tabs">
          <button 
            className={`tab-btn ${type === 'hotel' ? 'active' : ''}`}
            onClick={() => setType('hotel')}
          >
            <FiHome className="tab-icon" /> Hotel
          </button>
          <button 
            className={`tab-btn ${type === 'restaurant' ? 'active' : ''}`}
            onClick={() => setType('restaurant')}
          >
            <FiCoffee className="tab-icon" /> Restaurant
          </button>
          <button 
            className={`tab-btn ${type === 'activity' ? 'active' : ''}`}
            onClick={() => setType('activity')}
          >
            <FiActivity className="tab-icon" /> Activity
          </button>
        </div>

        <form onSubmit={handleSubmit} className="business-form">
          <div className="form-grid">
            {fields.map((field) => (
              <div className={`form-group ${field.required ? 'required' : ''}`} key={field.name}>
                <label>
                  {field.label}
                  {field.type === 'file' && <FiUpload className="input-icon" />}
                </label>
                
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                  />
                ) : field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    multiple={field.multiple}
                    onChange={handleChange}
                    value={field.type !== "file" ? formData[field.name] || "" : undefined}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="location-section">
            <h3>
              <FiMapPin className="section-icon" /> Location
            </h3>
            <p>Click on the map to set your business location</p>
            <div className="map-container">
              <MapContainer 
                center={latLng} 
                zoom={13} 
                style={{ height: "300px", borderRadius: "8px" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapView setLatLng={setLatLng} latLng={latLng} />
              </MapContainer>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              "Submit Business"
            )}
          </button>
        </form>
      </div>
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        toastClassName="toast-message"
        progressClassName="toast-progress"
      />
    </div>
  )
};

export default BusinessDashboard;
