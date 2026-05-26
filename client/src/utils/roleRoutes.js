// utils/roleRoutes.js

// Department name → dashboard route (for "head" role users)
export const DEPARTMENT_ROUTES = {
  venue:         "/dashboard-venue",
  icts:          "/dashboard-ictcs",
  ictcs:         "/dashboard-ictcs",
  audio:         "/dashboard-audio",
  transport:     "/dashboard-transports",
  accomadation:  "/dashboard-accommodation",  // note: DB has typo "Accomadation"
  accommodation: "/dashboard-accommodation",
  purchase:      "/dashboard-purchase",
  media:         "/dashboard-media",
  poster:        "/dashboard-poster",
  food:          "/dashboard-food",
  video:         "/dashboard-video",
};

// Role → dashboard route (for non-head roles)
export const ROLE_ROUTES = {
  faculty:         "/dashboard-faculty",
  hod:             "/dashboard-faculty",   // HODs use faculty dashboard
  "super admin 1": "/dashboard-admin",
  "super admin 2": "/dashboard-admin",
  "super admin":   "/dashboard-admin",
  super_admin:     "/dashboard-admin",
  superadmin:      "/dashboard-admin",
  admin:           "/dashboard-admin",
  user:            "/forms",
};

/**
 * Main routing function.
 * For "head" role → use department to decide dashboard.
 * For all others  → use role directly.
 */
export function getRouteForRole(role, department) {
  if (!role) {
    console.warn("⚠️ getRouteForRole: no role provided");
    return "/forms";
  }

  const normalizedRole = role.toLowerCase().trim();
  const normalizedDept = department?.toLowerCase().trim() ?? "";

  // ── "head" role: route by department ─────────────────────────────
  if (normalizedRole === "head") {
    const deptRoute = DEPARTMENT_ROUTES[normalizedDept];
    if (deptRoute) {
      console.log(`✅ head + dept "${department}" → ${deptRoute}`);
      return deptRoute;
    }
    console.warn(`⚠️ head role but unknown department "${department}" → /forms`);
    return "/forms";
  }

  // ── All other roles: route by role string ─────────────────────────
  const roleRoute = ROLE_ROUTES[normalizedRole];

  // Safety net: anything containing "admin" → admin dashboard
  if (!roleRoute && normalizedRole.includes("admin")) {
    console.warn(`⚠️ Unknown admin variant "${role}" → /dashboard-admin`);
    return "/dashboard-admin";
  }

  if (!roleRoute) {
    console.warn(`⚠️ Unknown role "${role}" → /forms`);
  }

  return roleRoute ?? "/forms";
}