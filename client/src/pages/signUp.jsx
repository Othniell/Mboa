import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
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
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, form);
      alert(res.data.message || "Signup successful!");
      navigate("/login");
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Something went wrong. Please try again.";
      alert(errMsg);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form-section">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="visitor">Visitor</option>
              <option value="business">Business Owner</option>
            </select>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
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
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-password-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
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
                required
              />
            </div>
          )}

          <button type="submit" className="signup-btn">
            Create Account
          </button>

          <div className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Log in</span>
          </div>
        </form>
      </div>

      <div className="signup-image-section">{/* optional image */}</div>
    </div>
  );
};

export default Signup;
