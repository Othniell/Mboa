import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";
import "./Signup.css";

const Signup = ({ onClose, isModal = false }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    role: "visitor",
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    businessName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, form);
      alert(res.data.message || "Signup successful!");
      if (isModal && onClose) onClose();
      else navigate("/login");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      alert(errMsg);
    }
  };

  return (
    <div className={`signup-wrapper ${isModal ? "modal-mode" : ""}`}>
      <div className="signup-card">
        {isModal && (
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        )}

        <h2>Create Your Account</h2>
        <p className="subtitle">Join us to get started</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>I am a:</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-btn ${form.role === "visitor" ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: "visitor" })}
              >
                Visitor
              </button>
              <button
                type="button"
                className={`role-btn ${form.role === "business" ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: "business" })}
              >
                Business Owner
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g., johndoe"
              required
            />
          </div>

          <div className="name-fields">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {form.role === "business" && (
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                placeholder="Your Business LLC"
                required
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            Sign Up
          </button>

          <p className="login-redirect">
            Already have an account?{" "}
            <span onClick={() => (isModal ? onClose() : navigate("/login"))}>
              Log In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;