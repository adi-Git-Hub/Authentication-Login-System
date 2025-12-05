// src/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  if (!email) return <h2>No session found</h2>;

  const handleReset = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do NOT match");
      return;
    }

    const res = await fetch("http://localhost:5000/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password   // FIXED
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Something went wrong");
      return;
    }

    alert("Password reset successful!");

    localStorage.removeItem("resetEmail");
    localStorage.removeItem("resetUsername");

    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="Enter New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 15 }}
      />

      <button
        onClick={handleReset}
        style={{
          width: "100%",
          padding: 12,
          background: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Reset Password
      </button>
    </div>
  );
}

