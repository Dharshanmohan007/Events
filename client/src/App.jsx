import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "./Components/CustomToast";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

// Pages
import EventsForm from './Pages/EventsForm'
import ICTCSDashboard from './Pages/Dashboards/ICTC-Dashboard/ICTCSDashboard'
import AUDIODashboard from './Pages/Dashboards/AUDIO-Dashboard/AUDIODashboard'
import Login from './Pages/Login'
import SignUp from './Pages/SignUp'
import ForgetPassword from './Components/ForgetPassword'  

// Auth Context
import { AuthProvider, useAuth } from "./Components/AuthContext";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import { useEffect } from "react";



// ─── Route Wrapper for Login Redirect ────────────────────────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  // Wait for auth check before deciding
  if (loading) return null;
  return user ? <Navigate to="/forms" replace /> : children;
}

// ─── App Routes ─────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Login Route */}
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
      {/* Sign Up Route */}
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      <Route
        path="/forget-password"
        element={
          <PublicRoute>
            <ForgetPassword />
          </PublicRoute>
        }
      />

      {/* Protected Main Route */}
      <Route
        path="/forms"
        element={
          <ProtectedRoute>
            <EventsForm />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Main App Wrapper ───────────────────────────────────────────────────────
function App() {
    
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={1500}  />

      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
