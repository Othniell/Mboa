import React, { useState } from "react";
import axios from "axios";
import "./AddBusinessForm.css";

const fieldMap = {
  hotel: [
    { name: "name", label: "Hotel Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "address", label: "Address", type: "text" },
    { name: "lat", label: "Latitude", type: "number", required: true },
    { name: "lng", label: "Longitude", type: "number", required: true },
    { name: "contact", label: "Contact", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "pricePerNight", label: "Price Per Night", type: "number" },
    { name: "priceCategory", label: "Price Category", type: "select", options: ["Luxury", "Mid-range", "Economy"] },
    { name: "policies", label: "Policies (comma-separated)", type: "text" },
    { name: "amenities", label: "Amenities (comma-separated)", type: "text" },
    { name: "images", label: "Images", type: "file", multiple: true }
  ],
  restaurant: [
    { name: "name", label: "Restaurant Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "location", label: "Address", type: "text" },
    { name: "lat", label: "Latitude", type: "number", required: true },
    { name: "lng", label: "Longitude", type: "number", required: true },
    { name: "cuisine", label: "Cuisine", type: "text" },
    { name: "price", label: "Average Price", type: "number" },
    { name: "priceCategory", label: "Price Category", type: "select", options: ["Luxury", "Mid-range", "Economy"] },
    { name: "images", label: "Images", type: "file", multiple: true }
  ],
  activity: [
    { name: "name", label: "Activity Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "location", label: "Location Name", type: "text" },
    { name: "lat", label: "Latitude", type: "number", required: true },
    { name: "lng", label: "Longitude", type: "number", required: true },
    { name: "category", label: "Category", type: "text" },
    { name: "priceCategory", label: "Price Category", type: "select", options: ["Luxury", "Mid-range", "Economy"] },
    { name: "images", label: "Images", type: "file", multiple: true }
  ]
};

const AddBusinessForm = () => {
  const [type, setType] = useState("hotel");
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

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

      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/business/create", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : ""
        }
      });

      alert(res.data.message);
      setFormData({});
      setImages([]);
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
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

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Submitting..." : "Submit Business"}
        </button>
      </form>
    </div>
  );
};

export default AddBusinessForm;
