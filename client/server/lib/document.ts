import { randomBytes, createHash } from "crypto";

export function generateId(): string {
  return `doc_${Date.now()}_${randomBytes(8).toString("hex")}`;
}

export function hashAccessCode(accessCode: string): string {
  return createHash("sha256").update(accessCode).digest("hex");
}

export function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateDocumentId(): string {
  return `doc_${Date.now()}_${randomBytes(8).toString("hex")}`;
}

export function generateVersionId(): string {
  return `v${Date.now()}_${randomBytes(4).toString("hex")}`;
}
