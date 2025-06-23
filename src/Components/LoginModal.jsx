import React from "react";
import LoginForm from "../pages/LoginForm";
import "./LoginModal.css"; // optional, for styling modal overlay & container

const LoginModal = ({ onClose, onLoginSuccess }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginModal;
