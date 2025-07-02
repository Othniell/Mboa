import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineClose } from "react-icons/ai";
import "./loginform.css";
import { useAuth } from "../context/AuthContext";

const Login = ({ onClose, onLoginSuccess, isModal = false }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, form);
      if (res.data?.token && res.data?.user) {
        login(res.data.user, res.data.token);

        if (onLoginSuccess) onLoginSuccess(res.data.user);
        else {
          const role = res.data.user.role;
          navigate(role === "business" ? "/dashboard" : role === "admin" ? "/admin" : "/");
        }

        if (onClose) onClose();
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message || error.message || "Login failed. Please try again.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToSignup = () => {
    if (onClose) onClose(); // Close modal if needed
    navigate("/signup");
  };

  return (
    <div className="login-modal">
      <div className="login-container">
        {onClose && (
          <button className="close-button" onClick={onClose}>
            <AiOutlineClose size={20} />
          </button>
        )}

        <div className="login-form-section">
          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
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
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password"
                >
                  {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </span>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <div className="signup-link">
              Don't have an account?{" "}
              <span
                onClick={handleRedirectToSignup}
                style={{ color: "#007bff", cursor: "pointer", fontWeight: "bold" }}
              >
                Sign up
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
