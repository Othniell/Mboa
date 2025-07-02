import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch logs:", err);
        toast.error("⚠️ Could not load admin logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🧾 Admin Action Logs</h2>

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : logs.length === 0 ? (
        <p>No admin actions logged yet.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%", marginTop: "20px" }}>
          <thead style={{ background: "#f2f2f2" }}>
            <tr>
              <th>👤 Admin</th>
              <th>🏢 Business</th>
              <th>✅ Action</th>
              <th>📅 Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : "Unknown"}</td>
                <td>{log.business ? log.business.name : "Unknown"}</td>
                <td style={{ textTransform: "capitalize" }}>{log.action}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default AdminLogs;
