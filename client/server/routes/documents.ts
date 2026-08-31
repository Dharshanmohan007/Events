import { Router, type Request, type Response } from "express";
import { DocumentsDatabase } from "../services/database.js";
import {
  validateDocumentCreation,
  validateVersionCreation,
  validateDocumentUpdate,
} from "../middleware/validation.js";
import { authenticateUser, requireRole, getUserFromRequest } from "../middleware/auth.js";
import {
  generateDocumentId,
  generateAccessCode,
  hashAccessCode,
} from "../lib/document.js";
import type { DocumentRecord, DocumentVersion } from "../types/shared.js";

const router = Router();

// Database instance (will be injected via middleware)
let db: DocumentsDatabase;

export function setDatabase(database: DocumentsDatabase): void {
  db = database;
}

// GET /api/documents - List all documents (admin/agency only)
router.get(
  "/",
  authenticateUser,
  requireRole("admin", "agency"),
  (req: Request, res: Response): void => {
    try {
      const documents = db.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/documents/:id - Get document by ID (requires appropriate role)
router.get(
  "/:id",
  authenticateUser,
  requireRole("admin", "agency", "client"),
  (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const document = db.getDocumentById(id);

      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      // Clients can only access documents they have access to via access code
      const user = getUserFromRequest(req);
      if (user.role === "client") {
        // For client role, we need to check access code
        // This is handled by the access-code endpoint
        res.status(403).json({ error: "Use access code to view documents" });
        return;
      }

      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/documents/access/:accessCode - Get document by access code
router.get(
  "/access/:accessCode",
  authenticateUser,
  (req: Request, res: Response): void => {
    try {
      const { accessCode } = req.params;
      const hashedCode = hashAccessCode(accessCode);
      const document = db.getDocumentByAccessCode(hashedCode);

      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      res.json(document);
    } catch (error) {
      console.error("Error fetching document by access code:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// POST /api/documents - Create a new document (admin/agency only)
router.post(
  "/",
  authenticateUser,
  requireRole("admin", "agency"),
  validateDocumentCreation,
  (req: Request, res: Response): void => {
    try {
      const { accessCode, title, description, category, status } = req.body;

      // Hash the access code for storage
      const hashedCode = hashAccessCode(accessCode);

      // Check if access code already exists
      const existingDoc = db.getDocumentByAccessCode(hashedCode);
      if (existingDoc) {
        res.status(400).json({ error: "Access code already exists" });
        return;
      }

      const now = new Date().toISOString();
      const document: DocumentRecord = {
        id: generateDocumentId(),
        accessCode: hashedCode,
        title,
        description: description || "",
        category: category || "general",
        status: status || "active",
        createdAt: now,
        updatedAt: now,
        latestContent: "",
      };

      db.addDocument(document);

      // Return document without the hashed access code
      res.status(201).json({
        ...document,
        accessCode: accessCode, // Return original access code
      });
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PUT /api/documents/:id - Update a document (admin/agency only)
router.put(
  "/:id",
  authenticateUser,
  requireRole("admin", "agency"),
  validateDocumentUpdate,
  (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existingDoc = db.getDocumentById(id);
      if (!existingDoc) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      const updatedDoc = db.updateDocument(id, updates);
      if (!updatedDoc) {
        res.status(500).json({ error: "Failed to update document" });
        return;
      }

      res.json(updatedDoc);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// DELETE /api/documents/:id - Delete a document (admin only)
router.delete(
  "/:id",
  authenticateUser,
  requireRole("admin"),
  (req: Request, res: Response): void => {
    try {
      const { id } = req.params;

      const existingDoc = db.getDocumentById(id);
      if (!existingDoc) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      const deleted = db.deleteDocument(id);
      if (!deleted) {
        res.status(500).json({ error: "Failed to delete document" });
        return;
      }

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// POST /api/documents/:id/versions - Add a new version (admin/agency/creative/producer/editor)
router.post(
  "/:id/versions",
  authenticateUser,
  requireRole("admin", "agency", "creative", "producer", "editor"),
  validateVersionCreation,
  (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { title, content, status, metadata, projectId } = req.body;

      const existingDoc = db.getDocumentById(id);
      if (!existingDoc) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      const version = db.addVersion(id, {
        title,
        content,
        status: status || "draft",
        metadata,
        projectId,
      });

      res.status(201).json(version);
    } catch (error) {
      console.error("Error adding version:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/documents/:id/versions - Get all versions for a document
router.get(
  "/:id/versions",
  authenticateUser,
  requireRole("admin", "agency", "client"),
  (req: Request, res: Response): void => {
    try {
      const { id } = req.params;

      const existingDoc = db.getDocumentById(id);
      if (!existingDoc) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      const versions = db.getDocumentVersions(id);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
