import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

const logout = useCallback(() => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setUser(null);
}, []);

useEffect(() => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (token && storedUser) {
    try {
      setUser(JSON.parse(storedUser));
    } catch {}

    fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (r) => {
        if (!r.ok) {
          throw new Error("Unauthorized");
        }

        return r.json();
      })
      .then((data) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch((err) => {
        console.error(err);
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  } else {
    setLoading(false);
  }
}, [logout]);

  const login = useCallback((userData) => {
    setUser(userData);
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