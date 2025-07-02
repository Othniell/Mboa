import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiHome, FiCheck, FiX, FiImage, FiMapPin, FiInfo } from "react-icons/fi";
import "./AdminBusinessReview.css";

const AdminBusinessReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredType, setFilteredType] = useState("hotel");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/all-businesses`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        setSubmissions(res.data);
      } catch (err) {
        console.error("Failed to fetch", err);
        toast.error("Failed to load businesses.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleAction = async (id, action) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/admin/businesses/${id}/${action}`;
      const res = await axios.post(url, {}, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      toast.success(res.data.message || `${action} successful`);

      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, status: action === "approve" ? "validated" : "rejected" }
            : item
        )
      );
    } catch (err) {
      console.error("Action error:", err);
      toast.error("Action failed.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredSubmissions = submissions.filter((item) => {
    const businessType = item.type || item.category;
    return businessType === filteredType;
  });

  const pending = filteredSubmissions.filter(
    (item) => item.status?.toLowerCase() === "pending"
  );

  const validated = filteredSubmissions.filter(
    (item) => item.status?.toLowerCase() === "validated"
  );

  const renderSubmissionCard = (item, showActions = false) => {
    const locationText =
      typeof item.location === "object"
        ? item.location?.address
        : item.location || item.address || "No location";

    return (
      <div key={item._id} className="submission-card">
        <div className="card-header">
          <h3 className="submission-name">{item.name}</h3>
          {showActions ? (
            <span className="status-badge pending">Pending Review</span>
          ) : (
            <span className="status-badge validated">Approved</span>
          )}
        </div>
        
        <div className="submission-desc">
          <FiInfo className="icon" />
          {item.description || "No description provided"}
        </div>
        
        <div className="submission-location">
          <FiMapPin className="icon" />
          {locationText}
        </div>
        
        {item.images?.length > 0 && (
          <div className="submission-images">
            <div className="images-header">
              <FiImage className="icon" />
              <span>Images ({item.images.length})</span>
            </div>
            <div className="image-grid">
              {item.images.slice(0, 3).map((img, i) => (
                <div className="image-container" key={i}>
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${img}`}
                    alt="Business preview"
                    className="submission-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                  {i === 2 && item.images.length > 3 && (
                    <div className="image-overlay">+{item.images.length - 3}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showActions && (
          <div className="submission-actions">
            <button
              onClick={() => handleAction(item._id, "approve")}
              className="action-btn approve-btn"
              disabled={processing}
            >
              <FiCheck className="icon" /> Approve
            </button>
            <button
              onClick={() => handleAction(item._id, "reject")}
              className="action-btn reject-btn"
              disabled={processing}
            >
              <FiX className="icon" /> Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <nav className="admin-sidebar">
        <div className="sidebar-header">
          <FiHome className="logo-icon" />
          <h2>Business Admin</h2>
        </div>
        
        <div className="sidebar-section">
          <h3>Categories</h3>
          <div className="category-buttons">
            {["hotel", "restaurant", "activity"].map((type) => (
              <button
                key={type}
                onClick={() => setFilteredType(type)}
                className={`category-btn ${filteredType === type ? "active" : ""}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {filteredType.charAt(0).toUpperCase() + filteredType.slice(1)} Management
          </h1>
        </header>

        <section className="content-section">
          <div className="section-header">
            <h2>Pending Submissions</h2>
            <span className="count-badge">{pending.length}</span>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading submissions...</p>
            </div>
          ) : pending.length === 0 ? (
            <div className="empty-state">
              <p>No pending {filteredType} submissions</p>
            </div>
          ) : (
            <div className="card-grid">
              {pending.map((item) => renderSubmissionCard(item, true))}
            </div>
          )}
        </section>

        <section className="content-section">
          <div className="section-header">
            <h2>Approved Businesses</h2>
            <span className="count-badge">{validated.length}</span>
          </div>
          
          {validated.length === 0 ? (
            <div className="empty-state">
              <p>No approved {filteredType} businesses</p>
            </div>
          ) : (
            <div className="card-grid">
              {validated.map((item) => renderSubmissionCard(item))}
            </div>
          )}
        </section>
      </main>

      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        toastClassName="toast-message"
        progressClassName="toast-progress"
      />
    </div>
  );
};

export default AdminBusinessReview;