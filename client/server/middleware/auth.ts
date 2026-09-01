import type { Request, Response, NextFunction } from "express";
import type { User, UserRole } from "../types/shared.js";

// In-memory user store (would be replaced with a real auth system)
const users: User[] = [
  { id: "user-1", name: "John Client", email: "john@client.com", role: "client" },
  { id: "user-2", name: "Sarah Agency", email: "sarah@agency.com", role: "agency" },
  { id: "user-3", name: "Mike Admin", email: "mike@admin.com", role: "admin" },
  { id: "user-4", name: "Emily Creative", email: "emily@creative.com", role: "creative" },
  { id: "user-5", name: "David Producer", email: "david@producer.com", role: "producer" },
  { id: "user-6", name: "Lisa Editor", email: "lisa@editor.com", role: "editor" },
];

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Simulate JWT token authentication
  // In production, this would validate a real JWT token
  const authHeader = req.headers.authorization;
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // For demo purposes, assign a default user if no token provided
    req.user = users[0]; // Default to client user
    return next();
  }

  // In a real app, you would verify the JWT token here
  // For demo, we'll use the x-user-id header to select a user
  const user = users.find((u) => u.id === userId) || users[0];
  req.user = user;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      res.status(403).json({
        error: "Access denied",
        message: `Required role: ${roles.join(" or ")}`,
      });
      return;
    }

    next();
  };
}

export function getUserFromRequest(req: Request): User {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
  return req.user;
}
