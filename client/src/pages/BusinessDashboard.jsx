import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "./Businessdashboard.css";

const fieldMap = {
  hotel: [
    { name: "name", label: "Hotel Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "address", label: "Address", type: "text" },
    { name: "lat", label: "Latitude", type: "number", required: true },
    { name: "lng", label: "Longitude", type: "number", required: true },
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
    { name: "lat", label: "Latitude", type: "number", required: true },
    { name: "lng", label: "Longitude", type: "number", required: true },
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
    { name: "lat", label: "Latitude", type: "number", required: true },
    { name: "lng", label: "Longitude", type: "number", required: true },
    { name: "category", label: "Category", type: "text" },
    { name: "priceCategory", label: "Price Category", type: "select", options: ["Luxury", "Mid-range", "Economy"] },
    { name: "images", label: "Images", type: "file", multiple: true },
  ],
};

const MapView = ({ setLatLng }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLatLng({ lat, lng });
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return null;
};

const BusinessDashboard = () => {
  const [type, setType] = useState("hotel");
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [latLng, setLatLng] = useState({ lat: 4.0511, lng: 9.7679 });

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
    <div className="business-form-container">
      <h2>Add a New Business</h2>
      <form onSubmit={handleSubmit} className="business-form">
        <div className="form-group">
          <label>Type of Business</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="hotel">Hotel</option>
            <option value="restaurant">Restaurant</option>
            <option value="activity">Activity</option>
          </select>
        </div>

        {fields.map((field) => (
          <div className="form-group" key={field.name}>
            <label>{field.label}</label>
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
                <option value="">Select</option>
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

        <div className="map-container">
          <MapContainer center={latLng} zoom={13} style={{ height: "300px" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapView setLatLng={setLatLng} />
            <Marker position={latLng}>
              <Popup>{`Latitude: ${latLng.lat}, Longitude: ${latLng.lng}`}</Popup>
            </Marker>
          </MapContainer>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Business"}
        </button>
      </form>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default BusinessDashboard;
