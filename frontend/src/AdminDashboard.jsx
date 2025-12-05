import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [user, setUser] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    setUser(username || "Admin");
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user}</p>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.location.href = "/login";
        }}
        style={{
          padding: "10px 20px",
          marginTop: 20,
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: 5,
        }}
      >
        Logout
      </button>
    </div>
  );
}

