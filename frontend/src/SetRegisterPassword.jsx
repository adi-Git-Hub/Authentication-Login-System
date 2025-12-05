// src/SetRegisterPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SetRegisterPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("regEmail");

  if (!email) return <h2>No registration session found</h2>;

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do NOT match");
      return;
    }

    const res = await fetch("http://localhost:5000/register-step3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Something went wrong");
      return;
    }

    alert("Account created successfully!");

    localStorage.removeItem("regEmail");
    localStorage.removeItem("regUsername");

    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
      <h2>Create Password</h2>

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 15 }}
      />

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: 12,
          background: "#2196f3",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Create Account
      </button>
    </div>
  );
}

