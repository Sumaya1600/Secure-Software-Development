// frontend/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CreateCampaign from "./components/CreateCampaign";
import EducationLanding from "./components/EducationLanding";

// Simple protected route: must be logged in
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// Role protected route: must be logged in AND have allowed role
function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    // viewer trying to access create-campaign etc.
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Education landing (can be public) */}
          <Route path="/education/:token" element={<EducationLanding />} />

          {/* Protected: any logged in user */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Protected by role: admin + instructor only */}
          <Route
            path="/create-campaign"
            element={
              <RoleRoute allowedRoles={["admin", "instructor"]}>
                <CreateCampaign />
              </RoleRoute>
            }
          />

          {/* Root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
