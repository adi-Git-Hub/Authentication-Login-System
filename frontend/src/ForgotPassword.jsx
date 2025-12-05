import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username || !email) {
      alert("Enter username and registered email");
      return;
    }

    const res = await fetch("http://localhost:5000/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email })
    });

    const data = await res.json();

    if (data.success !== true) {
      alert(data.message || "Invalid username/email");
      return;
    }

    // store temporarily
    localStorage.setItem("resetEmail", email);
    localStorage.setItem("resetUsername", username);

    navigate("/forgot-password-otp");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Forgot Password</h2>

      <input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: "block", marginBottom: 12, padding: 8, width: "100%" }}
      />

      <input
        type="email"
        placeholder="Enter Your Registered Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 12, padding: 8, width: "100%" }}
      />

      <button
        onClick={handleSubmit}
        style={{ padding: 10, width: "100%" }}
      >
        Send OTP
      </button>
    </div>
  );
}

