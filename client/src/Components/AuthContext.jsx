import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { decodeToken, isTokenExpired } from "../utils/tokenUtils";

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
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);

    if (!decoded || isTokenExpired(decoded)) {
      logout();
      setLoading(false);
      return;
    }

    try {
      const cached = JSON.parse(storedUser);
      const roleFromToken = decoded.role || decoded.department || cached.role;
      setUser({ ...cached, role: roleFromToken });
    } catch {
      logout();
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) throw new Error("TOKEN_EXPIRED");
        if (!r.ok) throw new Error("SERVER_ERROR");
        return r.json();
      })
      .then((data) => {
        const decoded2 = decodeToken(localStorage.getItem("token"));
        const roleFromToken = decoded2?.role || decoded2?.department || data.role;
        const freshUser = { ...data, role: roleFromToken };
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      })
      .catch((err) => {
        if (err.message === "TOKEN_EXPIRED") {
          logout();
        } else {
          console.warn("Auth check failed (network/server):", err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "token" && !e.newValue) setUser(null);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ── login: set user AND return the user so caller can navigate immediately
  const login = useCallback((userData) => {
    setUser(userData);
    return userData; // return so Login.jsx can use it
  }, []);

  const hasPermission = useCallback(
    (permission) => {
      if (!user?.permissions) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}