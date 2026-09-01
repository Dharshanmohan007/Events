import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../types/shared.js";

interface ValidationError {
  field: string;
  message: string;
}

export function validateDocumentCreation(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: ValidationError[] = [];
  const { accessCode, title } = req.body;

  if (!accessCode || typeof accessCode !== "string" || accessCode.trim().length === 0) {
    errors.push({ field: "accessCode", message: "Access code is required" });
  }

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push({ field: "title", message: "Title is required" });
  }

  if (errors.length > 0) {
    res.status(400).json({ error: "Validation failed", details: errors });
    return;
  }

  next();
}

export function validateVersionCreation(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: ValidationError[] = [];
  const { status } = req.body;

  const allowedStatuses: string[] = ["draft", "review", "approved", "published", "archived"];
  if (status && !allowedStatuses.includes(status)) {
    errors.push({
      field: "status",
      message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
    });
  }

  if (errors.length > 0) {
    res.status(400).json({ error: "Validation failed", details: errors });
    return;
  }

  next();
}

export function validateDocumentUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: ValidationError[] = [];
  const { title, status, category } = req.body;

  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    errors.push({ field: "title", message: "Title cannot be empty" });
  }

  const allowedStatuses: string[] = ["active", "archived", "pending", "review", "approved"];
  if (status !== undefined && !allowedStatuses.includes(status)) {
    errors.push({
      field: "status",
      message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
    });
  }

  const allowedCategories: string[] = ["general", "contracts", "proposals", "reports", "creative", "legal", "financial"];
  if (category !== undefined && !allowedCategories.includes(category)) {
    errors.push({
      field: "category",
      message: `Invalid category. Allowed: ${allowedCategories.join(", ")}`,
    });
  }

  if (errors.length > 0) {
    res.status(400).json({ error: "Validation failed", details: errors });
    return;
  }

  next();
}

export function validateUserAssignment(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: ValidationError[] = [];
  const { userId, role } = req.body;

  if (!userId || typeof userId !== "string") {
    errors.push({ field: "userId", message: "Valid user ID is required" });
  }

  const allowedRoles: UserRole[] = ["client", "agency", "creative", "producer", "editor", "admin"];
  if (!role || !allowedRoles.includes(role)) {
    errors.push({
      field: "role",
      message: `Invalid role. Allowed: ${allowedRoles.join(", ")}`,
    });
  }

  if (errors.length > 0) {
    res.status(400).json({ error: "Validation failed", details: errors });
    return;
  }

  next();
}
