import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

export function ProtectedRoute({ children, requiredPermission }) {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  console.log("🔐 ProtectedRoute check:", { user, loading });

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <div>Access Denied</div>;
  }

  return children;
}