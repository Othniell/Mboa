import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedCuisine, setEditedCuisine] = useState({});
  const token = localStorage.getItem("token");
  const backendURL = "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/admin/businesses/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch pending businesses");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, action) => {
    try {
      const payload = {};
      const currentBusiness = businesses.find((b) => b._id === id);

      // If approving a restaurant, attach cuisine
      if (action === "approve" && currentBusiness?.type === "restaurant") {
        if (!editedCuisine[id]) {
          alert("Please enter a cuisine for the restaurant before approving.");
          return;
        }
        payload.cuisine = editedCuisine[id];
      }

      await axios.post(`${backendURL}/api/admin/businesses/${id}/${action}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Business ${action}d successfully`);
      if (action === "approve") {
        navigate(`/admin/businesses/${id}`);
      } else {
        fetchPending();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update business status");
    }
  };

  const fixPath = (path) => `${backendURL}/${path.replace(/\\/g, "/")}`;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pending Business Submissions</h2>

      {loading ? (
        <p>Loading...</p>
      ) : businesses.length === 0 ? (
        <p>No pending submissions</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {businesses.map((b) => (
            <li
              key={b._id}
              style={{ border: "1px solid #ccc", margin: "10px 0", padding: "15px", borderRadius: "8px" }}
            >
              <h3>{b.name || "Unnamed Business"} ({b.type})</h3>
              <p><strong>Description:</strong> {b.description || "No description provided"}</p>
              <p><strong>Location:</strong> {b.location?.lat?.toFixed(4)}, {b.location?.lng?.toFixed(4)}</p>
              <p><strong>Submitted by:</strong> {b.owner?.firstName || "Unknown"} {b.owner?.lastName || ""}</p>

              {/* Cuisine input only for restaurants */}
              {b.type === "restaurant" && (
                <div style={{ marginTop: "10px" }}>
                  <label><strong>Cuisine:</strong></label>
                  <input
                    type="text"
                    placeholder="e.g. Cameroonian"
                    value={editedCuisine[b._id] || ""}
                    onChange={(e) =>
                      setEditedCuisine((prev) => ({
                        ...prev,
                        [b._id]: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {b.businessImages?.length > 0 && (
                <div>
                  <p><strong>Images:</strong></p>
                  {b.businessImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={fixPath(img)}
                      alt="business"
                      width={100}
                      style={{ margin: "5px" }}
                    />
                  ))}
                </div>
              )}

              {b.businessDocs?.length > 0 && (
                <div>
                  <p><strong>Documents:</strong></p>
                  {b.businessDocs.map((doc, idx) => (
                    <a key={idx} href={fixPath(doc)} target="_blank" rel="noreferrer">
                      Document {idx + 1}
                    </a>
                  ))}
                </div>
              )}

              <button onClick={() => updateStatus(b._id, "approve")} style={{ marginRight: "10px" }}>
                ✅ Approve
              </button>
              <button onClick={() => updateStatus(b._id, "reject")}>❌ Reject</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
