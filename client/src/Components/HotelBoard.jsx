// Updated HotelBoard.jsx with backend integration and animated modals
import React, { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./hotelBoard.css";

const sections = [
  { key: "rooms", title: "Rooms" },
  { key: "pool", title: "Pool" },
  { key: "gym", title: "Gym" },
  { key: "location", title: "Location (Map)" },
  { key: "documents", title: "Documents" },
  { key: "description", title: "Description" },
  { key: "pricing", title: "Pricing" },
];

function LocationPicker({ setCoordinates }) {
  useMapEvents({
    click(e) {
      setCoordinates(e.latlng);
    },
  });
  return null;
}

const HotelBoard = ({ ownerInfo }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [coordinates, setCoordinates] = useState(null);
  const [fileUploads, setFileUploads] = useState({});

  const handleAdd = (sectionKey) => {
    setActiveModal(sectionKey);
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormData({});
    setFileUploads({});
    setCoordinates(null);
  };

  const handleFileChange = (e, sectionKey) => {
    const files = e.target.files;
    setFileUploads((prev) => ({ ...prev, [sectionKey]: files }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append("section", activeModal);
      data.append("owner", ownerInfo.ownerName);
      data.append("business", ownerInfo.businessName);
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));

      if (coordinates) {
        data.append("latitude", coordinates.lat);
        data.append("longitude", coordinates.lng);
      }

      if (fileUploads[activeModal]) {
        Array.from(fileUploads[activeModal]).forEach((file) => {
          data.append("files", file);
        });
      }

      const response = await axios.post("/api/hotel/section-data", data);
      console.log("Saved:", response.data);
      closeModal();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="hotel-board">
      <h2 className="board-title">Set Up Your Hotel</h2>
      <p className="owner-info">
        Owner: <strong>{ownerInfo.ownerName}</strong> — {ownerInfo.businessName}
      </p>

      <div className="section-grid">
        {sections.map((section) => (
          <div className="section-card" key={section.key}>
            <div className="section-header">
              <h3>{section.title}</h3>
              <button className="add-btn" onClick={() => handleAdd(section.key)}>
                ＋
              </button>
            </div>
            <p className="section-placeholder">Click + to add details</p>
          </div>
        ))}
      </div>

      {activeModal && (
        <div className="modal-overlay">
          <div className="modal-content slide-in">
            <h3>Add {sections.find((s) => s.key === activeModal)?.title}</h3>
            <button className="close-btn" onClick={closeModal}>
              ✖
            </button>

            {activeModal === "location" ? (
              <MapContainer center={[4.05, 9.7]} zoom={13} style={{ height: "300px" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker setCoordinates={setCoordinates} />
                {coordinates && <Marker position={coordinates} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" })} />}
              </MapContainer>
            ) : (
              <>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter title or details"
                  value={formData.title || ""}
                  onChange={handleChange}
                />
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e, activeModal)}
                />
              </>
            )}

            <button className="submit-btn" onClick={handleSubmit}>
              Save & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelBoard;
