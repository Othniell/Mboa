import React, { useState } from "react";
import HotelBoard from "./HotelBoard";
import RestaurantBoard from "./RestaurantBoard";
import ActivityBoard from "./ActivityBoard";
import "./modal.css";

const InfoModal = ({ sector, onClose }) => {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({
    ownerName: "",
    businessName: "",
    email: "",
    contact: "",
    countryCode: "",
  });

  const handleNext = () => setStep(2);

  const handleChange = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>

        {step === 1 ? (
          <div>
            <h3 className="modal-title">Enter Your Business Info</h3>
            <div className="modal-grid">
              <input name="ownerName" placeholder="Your Name" onChange={handleChange} />
              <input name="businessName" placeholder="Business Name" onChange={handleChange} />
              <input name="email" placeholder="Email" onChange={handleChange} />
              <input name="contact" placeholder="Phone Number" onChange={handleChange} />
              <input name="countryCode" placeholder="Country Code (e.g. +237)" onChange={handleChange} />
            </div>
            <button className="modal-next-btn" onClick={handleNext}>Next</button>
          </div>
        ) : sector === "hotel" ? (
          <HotelBoard ownerInfo={info} />
        ) : sector === "restaurant" ? (
          <RestaurantBoard ownerInfo={info} />
        ) : (
          <ActivityBoard ownerInfo={info} />
        )}
      </div>
    </div>
  );
};

export default InfoModal;
