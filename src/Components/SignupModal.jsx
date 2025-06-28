import React from "react";
import SignupForm from "../pages/signUp"; // adjust path if needed
import "./SignupModal.css"; // your custom styles for modal

const SignupModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <SignupForm onSignupSuccess={onClose} />
      </div>
    </div>
  );
};

export default SignupModal;
