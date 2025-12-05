import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  // Allow ANY logged-in user (admin OR user)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

