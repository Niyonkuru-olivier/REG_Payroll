export type LoggedUser = {
  role?: string;
};

const normalizeRole = (role: string): string =>
  (role || "").replace(/\s+/g, "").toLowerCase();

export function getDashboardRouteByRole(role: string): string | null {
  const normalizedRole = normalizeRole(role);
  if (["superadmin", "platformadmin"].includes(normalizedRole)) {
    return "/super-admin-dashboard";
  }
  if (["admin", "companyadmin", "branchhr"].includes(normalizedRole)) {
    return "/admin-dashboard";
  }
  if (["user", "employee"].includes(normalizedRole)) {
    return "/user-dashboard";
  }
  return null;
}

export function isRoleAllowedForRoute(role: string, route: string): boolean {
  return getDashboardRouteByRole(role) === route;
}

export function getLoggedUser(): LoggedUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("loggedUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoggedUser;
  } catch {
    return null;
  }
}
