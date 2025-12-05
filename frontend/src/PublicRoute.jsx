import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && role === "user") {
    return <Navigate to="/dashboard" replace />;
  }

  if (token && role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
}

