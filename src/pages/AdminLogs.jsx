import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch admin logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  if (loading) return <p>Loading logs...</p>;

  if (logs.length === 0) return <p>No admin actions logged yet.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Action Logs</h2>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Admin</th>
            <th>Business</th>
            <th>Action</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : "Unknown"}</td>
              <td>{log.business ? log.business.name : "Unknown"}</td>
              <td>{log.action}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLogs;
