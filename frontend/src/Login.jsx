import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setMsg("");
    setLoading(true);

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setMsg(data.message || "Invalid username or password");
      return;
    }

    // ==============================
    // FIXED USER ROLE ISSUE 🔥
    // ==============================
    const finalRole = data.role || "user";

    // Save token + role
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", finalRole);

    // Redirect based on role
    if (finalRole === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>Login</h2>

        {msg && (
          <div style={styles.errorContainer}>
            <span style={styles.errorIcon}>⚠</span>
            <span>{msg}</span>
          </div>
        )}

        <input
          style={styles.input}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        <p
          onClick={() => navigate("/forgot-password")}
          style={{ color: "blue", marginTop: 10, cursor: "pointer" }}
        >
          Forgot Password?
        </p>

        <p
          style={{ cursor: "pointer", color: "blue", marginTop: 10 }}
          onClick={() => navigate("/register")}
        >
          Create Account
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f3f3",
  },

  box: {
    padding: "40px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "300px",
  },

  errorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    background: "#ffe8e8",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ffbaba",
    color: "#b30000",
    fontWeight: "500",
    fontSize: "14px",
    marginBottom: "14px",
    boxShadow: "0 2px 6px rgba(255,0,0,0.15)",
  },

  errorIcon: {
    fontSize: "18px",
  },

  input: {
    width: "100%",
    padding: 10,
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },

  button: {
    width: "100%",
    padding: 10,
    background: "blue",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginTop: 10,
    borderRadius: "6px",
    transition: "0.2s",
  },
};

