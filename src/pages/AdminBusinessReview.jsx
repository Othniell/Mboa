import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminBusinessReview.css";

const AdminBusinessReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredType, setFilteredType] = useState("hotel");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/all-businesses");
        setSubmissions(res.data);
      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleAction = async (id, type, action) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/${type}/${id}/${action}`);
      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: action === "approve" ? "validated" : "rejected" } : item
        )
      );
    } catch (err) {
      console.error("Action error:", err);
    }
  };

 const filteredSubmissions = submissions.filter((item) => {
  if (item.type) return item.type === filteredType;
  if (item.category) return item.category === filteredType;
  return false;
});

  const pending = filteredSubmissions.filter((item) => item.status === "pending");
  const validated = filteredSubmissions.filter((item) => item.status === "validated");

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
              {pending.map((item) => (
                <div key={item._id} className="submission-card">
                  <div className="submission-name">{item.name}</div>
                  <div className="submission-desc">{item.description}</div>
                  <div className="submission-location">{item.location}</div>
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
                  <div className="submission-actions">
                    <button
                      onClick={() => handleAction(item._id, item.type, "approve")}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(item._id, item.type, "reject")}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="section-title">Validated</h2>
          {validated.length === 0 ? (
            <div className="empty">No validated businesses.</div>
          ) : (
            <div className="submission-grid">
              {validated.map((item) => (
                <div key={item._id} className="submission-card">
                  <div className="submission-name">{item.name}</div>
                  <div className="submission-desc">{item.description}</div>
                  <div className="submission-location">{item.location}</div>
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
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminBusinessReview;
