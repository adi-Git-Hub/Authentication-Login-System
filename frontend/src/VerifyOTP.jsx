import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyRegisterOTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  // FIXED KEY NAME
  const email = localStorage.getItem("regEmail");

  if (!email) {
    return <h2 style={{ textAlign: "center" }}>Invalid Registration Flow</h2>;
  }

  const handleVerify = async () => {
    const res = await fetch("http://localhost:5000/register-step2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Invalid OTP");
      return;
    }

    navigate("/set-register-password");
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center" }}>
      <h2>Verify Registration OTP</h2>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginTop: 20,
          marginBottom: 20,
          border: "1px solid #ccc",
          borderRadius: 6,
        }}
      />

      <button
        onClick={handleVerify}
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
        Verify OTP
      </button>
    </div>
  );
}

