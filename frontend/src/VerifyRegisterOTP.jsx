// src/VerifyRegisterOTP.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyRegisterOTP() {
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const navigate = useNavigate();

  const email = localStorage.getItem("regEmail");

  // TIMER
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  if (!email) {
    return (
      <h2 style={{ textAlign: "center", marginTop: 80 }}>
        Invalid Registration Flow
      </h2>
    );
  }

  // ==============================
  // VERIFY OTP
  // ==============================
  const handleVerify = async () => {
    setMsg("");
    setLoading(true);

    const res = await fetch("http://localhost:5000/register-step2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setMsg(data.message || "Invalid OTP");
      return;
    }

    navigate("/set-register-password");
  };

  // ==============================
  // RESEND OTP  (FIXED ROUTE)
  // ==============================
  const resendOTP = async () => {
    setMsg("");
    setTimer(30);

    await fetch("http://localhost:5000/register-step1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: localStorage.getItem("regUsername"),
        email: email,
      }),
    });

    setMsg("New OTP sent!");
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "80px auto",
        textAlign: "center",
        padding: 20,
        background: "#ffffff",
        borderRadius: 10,
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Verify Registration OTP</h2>

      {msg && (
        <div
          style={{
            background: "#ffe8e8",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ffbaba",
            color: "#b30000",
            marginTop: 15,
            fontWeight: "500",
            fontSize: 14,
          }}
        >
          {msg}
        </div>
      )}

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginTop: 20,
          border: "1px solid #ccc",
          borderRadius: 6,
          fontSize: 16,
        }}
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
          background: loading ? "#8bc34a" : "#4caf50",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: 20,
          fontSize: 16,
        }}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <p style={{ marginTop: 20, fontSize: 14, color: "#555" }}>
        Didn’t receive the OTP?
      </p>

      <button
        disabled={timer > 0}
        onClick={resendOTP}
        style={{
          width: "100%",
          padding: 10,
          background: timer > 0 ? "#9ca3af" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: timer > 0 ? "not-allowed" : "pointer",
          marginTop: 5,
          fontSize: 14,
        }}
      >
        {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
      </button>
    </div>
  );
}

