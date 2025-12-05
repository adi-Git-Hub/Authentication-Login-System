import { Navigate } from "react-router-dom";

export default function UserPrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but NOT a normal user
  if (role !== "user") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

