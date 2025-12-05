import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    const res = await fetch("http://localhost:5000/register-step1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Server error");
      return;
    }

    localStorage.setItem("regEmail", email);
    localStorage.setItem("regUsername", username);

    navigate("/verify-register-otp");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="title">Create Your Account</h2>
        <p className="subtitle">Enter details to receive the OTP</p>

        <div className="form">
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="primary-btn" onClick={sendOtp}>
            Send OTP
          </button>

          <p className="footer-text">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

