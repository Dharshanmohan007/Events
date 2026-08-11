import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const API_BASE = "https://sece-events.onrender.com";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const verifiedRef = useRef(false);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  useEffect(() => {
    // Prevent double-run in React StrictMode
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      // No credentials at all → go straight to login
      setLoading(false);
      return;
    }

    // Optimistically restore user so the UI doesn't flash
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      logout();
      setLoading(false);
      return;
    }

    // Verify token is still valid with the backend
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          // Token expired or invalid → force logout
          throw new Error("TOKEN_EXPIRED");
        }
        if (!r.ok) {
          throw new Error("SERVER_ERROR");
        }
        return r.json();
      })
      .then((data) => {
        // Token valid → update user with fresh data from server
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch((err) => {
        if (err.message === "TOKEN_EXPIRED") {
          // Expired → clear everything, ProtectedRoute will redirect to login
          logout();
        } else {
          // Network error or server error → keep the cached user
          // so the app still works offline / during server downtime
          console.warn("Auth check failed (network/server):", err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [logout]);

  // Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "token" && !e.newValue) {
        // Token was removed in another tab → log out this tab too
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const hasPermission = useCallback(
    (permission) => {
      if (!user?.permissions) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions) => {
      if (!user?.permissions) return false;
      return permissions.some((p) => user.permissions.includes(p));
    },
    [user]
  );

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