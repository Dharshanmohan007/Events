// utils/tokenUtils.js

/**
 * Decode a JWT token payload without verifying signature.
 * Returns null if token is missing or malformed.
 */
export function decodeToken(token) {
  try {
    if (!token) return null;
    const payload = token.split(".")[1];
    // atob handles base64, replace handles base64url encoding
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if a decoded token is expired.
 */
export function isTokenExpired(decoded) {
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

/**
 * Get role from token stored in localStorage.
 * Returns null if token missing/expired/malformed.
 */
export function getRoleFromToken() {
  const token = localStorage.getItem("token");
  const decoded = decodeToken(token);
  if (!decoded || isTokenExpired(decoded)) return null;
  // Your backend may use "role" or "department" — check both
  return decoded.role || decoded.department || null;
}