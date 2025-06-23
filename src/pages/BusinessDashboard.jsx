import React, { useState } from "react";
import axios from "axios";

const BusinessDashboard = () => {
  const [form, setForm] = useState({
    name: "",
    type: "restaurant",
    description: "",
    lat: 0,
    lng: 0,
    images: [],
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setForm(prev => ({ ...prev, images: Array.from(files) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(file => formData.append("images", file));
      } else {
        formData.append(key, value);
      }
    });

    try {
      const res = await axios.post(
        "http://localhost:5000/api/business/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // DO NOT set Content-Type manually!
          },
        }
      );
      alert("Business submitted!");
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Business Name" onChange={handleChange} required />
      <select name="type" onChange={handleChange} required>
        <option value="restaurant">Restaurant</option>
        <option value="hotel">Hotel</option>
        <option value="activity">Activity</option>
      </select>
      <textarea name="description" placeholder="Description" onChange={handleChange} />
      <input type="file" name="images" multiple onChange={handleChange} />
      {/* You can add your map here, or add lat/lng inputs */}
      <input name="lat" type="number" step="any" placeholder="Latitude" onChange={handleChange} required />
      <input name="lng" type="number" step="any" placeholder="Longitude" onChange={handleChange} required />
      <button type="submit">Submit Business</button>
    </form>
  );
};

export default BusinessDashboard;
