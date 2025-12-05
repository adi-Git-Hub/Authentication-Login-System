import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPrivateRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (role !== "admin") {
      navigate("/login", { replace: true });   // FIXED 🔥
      return;
    }
  }, [navigate]);

  return <>{children}</>;
}

