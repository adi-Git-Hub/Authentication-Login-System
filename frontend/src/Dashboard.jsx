import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  console.log("🔥 DASHBOARD RENDERED");

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetch("http://localhost:5000/protected-dashboard", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setLoading(false))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>User Dashboard</h1>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login", { replace: true });
        }}
        style={{ marginTop: 20 }}
      >
        Logout
      </button>
    </div>
  );
}

