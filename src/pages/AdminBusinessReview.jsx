import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
        const res = await axios.get("http://localhost:5000/api/admin/all-businesses", {
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
      const url = `http://localhost:5000/api/admin/businesses/${id}/${action}`;
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
        <div className="submission-name">{item.name}</div>
        <div className="submission-desc">{item.description}</div>
        <div className="submission-location">{locationText}</div>
        <div className="submission-images">
          {item.images?.map((img, i) => (
            <img
              key={i}
              src={`http://localhost:5000/uploads/${img}`}
              alt="Preview"
              className="submission-image"
            />
          ))}
        </div>
        {showActions && (
          <div className="submission-actions">
            <button
              onClick={() => handleAction(item._id, "approve")}
              className="approve-btn"
              disabled={processing}
            >
              Approve
            </button>
            <button
              onClick={() => handleAction(item._id, "reject")}
              className="reject-btn"
              disabled={processing}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>Categories</h2>
        {["hotel", "restaurant", "activity"].map((type) => (
          <button
            key={type}
            onClick={() => setFilteredType(type)}
            className={filteredType === type ? "active" : ""}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </aside>

      <div className="admin-content">
        <h1 className="section-title">
          {filteredType.charAt(0).toUpperCase() + filteredType.slice(1)} Submissions
        </h1>

        <section>
          <h2 className="section-title">Pending</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : pending.length === 0 ? (
            <div className="empty">No pending submissions.</div>
          ) : (
            <div className="submission-grid">
              {pending.map((item) => renderSubmissionCard(item, true))}
            </div>
          )}
        </section>

        <section>
          <h2 className="section-title">Validated</h2>
          {validated.length === 0 ? (
            <div className="empty">No validated businesses.</div>
          ) : (
            <div className="submission-grid">
              {validated.map((item) => renderSubmissionCard(item))}
            </div>
          )}
        </section>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default AdminBusinessReview;
