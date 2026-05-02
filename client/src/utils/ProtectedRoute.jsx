import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

export function ProtectedRoute({ children, requiredPermission }) {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  // 🚫 Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔐 Permission check (optional)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0d1a] text-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p className="text-white/60 text-sm">
            You don’t have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Authorized
  return children;
}