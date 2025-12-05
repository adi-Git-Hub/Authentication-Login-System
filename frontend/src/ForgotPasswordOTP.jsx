import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordOTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleVerify = async () => {
    const res = await fetch("http://localhost:5000/forgot-password-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        otp: otp.trim()
      })
    });

    const data = await res.json();

    if (data.success) {
      navigate("/create-new-password");
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button onClick={handleVerify}>Verify OTP</button>
    </div>
  );
}

