export type UserRole =
  | "client"
  | "agency"
  | "creative"
  | "producer"
  | "editor"
  | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface DocumentVersion {
  id: string;
  timestamp: string;
  projectId?: string;
  title?: string;
  content?: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface DocumentRecord {
  id: string;
  accessCode: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  currentVersionId?: string;
  latestContent?: string;
  versions?: DocumentVersion[];
}
