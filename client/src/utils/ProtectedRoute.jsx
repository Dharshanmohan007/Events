
// utils/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

/**
 * Just checks: are you logged in?
 * Role-based redirect already happened at login.
 * We don't block routes here — admins can visit any dashboard.
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}