// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import VerifyOTP from "./VerifyOTP";

import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";

import ForgotPassword from "./ForgotPassword";
import ForgotPasswordOTP from "./ForgotPasswordOTP";
import ResetPassword from "./ResetPassword";

import VerifyRegisterOTP from "./VerifyRegisterOTP";
import SetRegisterPassword from "./SetRegisterPassword";

import PublicRoute from "./PublicRoute";

import UserPrivateRoute from "./UserPrivateRoute";
import AdminPrivateRoute from "./AdminPrivateRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}

        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/verify-register-otp"
          element={
            <PublicRoute>
              <VerifyRegisterOTP />
            </PublicRoute>
          }
        />

        <Route
          path="/set-register-password"
          element={
            <PublicRoute>
              <SetRegisterPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/verify-otp"
          element={
            <PublicRoute>
              <VerifyOTP />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password-otp"
          element={
            <PublicRoute>
              <ForgotPasswordOTP />
            </PublicRoute>
          }
        />

        <Route
          path="/create-new-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* ================= PRIVATE ROUTES ================= */}

        <Route
          path="/dashboard"
          element={
            <UserPrivateRoute>
              <Dashboard />
            </UserPrivateRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <AdminPrivateRoute>
              <AdminDashboard />
            </AdminPrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

