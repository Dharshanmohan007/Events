import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, verify stored token
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      // Optimistically set user from storage, then verify with server
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.id) {
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  /**
   * Check if the current user has a specific permission
   * @param {string} permission - e.g. "venue", "media_poster"
   */
  const hasPermission = useCallback(
    (permission) => {
      if (!user?.permissions) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  /**
   * Check if user has any of the given permissions
   * @param {string[]} permissions
   */
  const hasAnyPermission = useCallback(
    (permissions) => {
      if (!user?.permissions) return false;
      return permissions.some((p) => user.permissions.includes(p));
    },
    [user]
  );

  /**
   * Check if user has all of the given permissions
   * @param {string[]} permissions
   */
  const hasAllPermissions = useCallback(
    (permissions) => {
      if (!user?.permissions) return false;
      return permissions.every((p) => user.permissions.includes(p));
    },
    [user]
  );

  const isAdmin = user?.role?.startsWith("admin") || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ─── HOC: ProtectedRoute ──────────────────────────────────────────────────────
/**
 * Wrap any route/page with this to require authentication.
 * Optionally pass `requiredPermission` or `requiredPermissions` to restrict by role.
 *
 * Usage:
 *   <ProtectedRoute requiredPermission="venue">
 *     <VenueForm />
 *   </ProtectedRoute>
 */
export function ProtectedRoute({ children, requiredPermission, requiredPermissions, fallback }) {
  const { user, loading, hasPermission, hasAnyPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0d1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white/40 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || <div className="text-white text-center p-10">Please log in to continue.</div>;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-[#0f0d1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold mb-2">Access Denied</p>
          <p className="text-white/40 text-sm">
            You don't have permission to access this section.
          </p>
        </div>
      </div>
    );
  }

  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return (
      <div className="min-h-screen bg-[#0f0d1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold mb-2">Access Denied</p>
          <p className="text-white/40 text-sm">
            You don't have permission to access this section.
          </p>
        </div>
      </div>
    );
  }

  return children;
}