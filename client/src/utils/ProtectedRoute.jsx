import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

export function ProtectedRoute({ children, requiredPermission }) {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  // Still verifying token with backend → render nothing (no flash)
  if (loading) return null;

  // No user (never logged in, token deleted, or token expired) → login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <div>Access Denied</div>;
  }

  return children;
}