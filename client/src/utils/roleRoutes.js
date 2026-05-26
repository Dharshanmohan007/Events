// utils/roleRoutes.js

export const ROLE_ROUTES = {
  // ── standard roles ──
  user:                    "/forms",
  faculty:                 "/dashboard-faculty",
  ictcs:                   "/dashboard-ictcs",
  audio:                   "/dashboard-audio",
  transport:               "/dashboard-transports",
  transports:              "/dashboard-transports",
  media:                   "/dashboard-media",
  accommodation:           "/dashboard-accommodation",
  venue:                   "/dashboard-venue",
  food:                    "/dashboard-food",
  "food and refreshment":  "/dashboard-food",
  "food_and_refreshment":  "/dashboard-food",
  purchase:                "/dashboard-purchase",
  admin:                   "/dashboard-admin",
  super_admin:             "/dashboard-admin",
  superadmin:              "/dashboard-admin",
  "super admin":           "/dashboard-admin",

  // ── your actual backend roles (from token) ──
  "super admin 2":         "/dashboard-admin",
  "super admin 1":         "/dashboard-admin",
};

export function getRouteForRole(role) {
  if (!role) {
    console.warn("⚠️ No role provided, falling back to /forms");
    return "/forms";
  }

  const normalized = role.toLowerCase().trim();
  const route = ROLE_ROUTES[normalized];

  if (!route) {
    console.warn(`⚠️ Unknown role: "${role}" → falling back to /forms`);
  }

  // ── safety net: if role contains "admin" anywhere → admin dashboard ──
  if (!route && normalized.includes("admin")) {
    console.warn(`⚠️ Role "${role}" contains "admin" → routing to /dashboard-admin`);
    return "/dashboard-admin";
  }

  return route ?? "/forms";
}