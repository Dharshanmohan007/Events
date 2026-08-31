import Database from "better-sqlite3";
import { config } from "../config/index.js";
import type { DocumentRecord, DocumentVersion } from "../types/shared.js";

export class DocumentsDatabase {
  private db: Database.Database | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.db = new Database(config.databasePath);

        this.db.pragma("journal_mode = WAL");
        this.db.pragma("synchronous = NORMAL");

        this.db.exec(`
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            access_code TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            category TEXT DEFAULT 'general',
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            current_version_id TEXT,
            latest_content TEXT DEFAULT ''
          );
        `);

        this.db.exec(`
          CREATE TABLE IF NOT EXISTS document_versions (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            project_id TEXT,
            title TEXT,
            content TEXT DEFAULT '',
            status TEXT DEFAULT 'draft',
            metadata TEXT DEFAULT '{}',
            FOREIGN KEY (document_id) REFERENCES documents (id)
          );
        `);

        this.db.exec(`
          CREATE INDEX IF NOT EXISTS idx_documents_access_code
          ON documents (access_code);
        `);

        this.db.exec(`
          CREATE INDEX IF NOT EXISTS idx_versions_document_id
          ON document_versions (document_id);
        `);

        console.log("Database initialized successfully");
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
    }
  }

  // -- Document queries ---------------------------------------------------

  getDocumentByAccessCode(
    accessCode: string,
  ): (DocumentRecord & { versions?: DocumentVersion[] }) | null {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = this.db.prepare(
      "SELECT * FROM documents WHERE access_code = ?",
    );
    const doc = stmt.get(accessCode) as DocumentRecord | undefined;

    if (!doc) return null;

    const versions = this.getDocumentVersions(doc.id);

    return {
      ...doc,
      versions,
    };
  }

  getDocumentById(
    documentId: string,
  ): (DocumentRecord & { versions?: DocumentVersion[] }) | null {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = this.db.prepare("SELECT * FROM documents WHERE id = ?");
    const doc = stmt.get(documentId) as DocumentRecord | undefined;

    if (!doc) return null;

    const versions = this.getDocumentVersions(doc.id);

    return {
      ...doc,
      versions,
    };
  }

  getAllDocuments(): DocumentRecord[] {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = this.db.prepare("SELECT * FROM documents ORDER BY updated_at DESC");
    return stmt.all() as DocumentRecord[];
  }

  addDocument(
    document: Omit<DocumentRecord, "versions">,
  ): DocumentRecord {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = this.db.prepare(`
      INSERT INTO documents (id, access_code, title, description, category, status, created_at, updated_at, current_version_id, latest_content)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      document.id,
      document.accessCode,
      document.title,
      document.description,
      document.category,
      document.status,
      document.createdAt,
      document.updatedAt,
      document.currentVersionId || null,
      document.latestContent || "",
    );

    return document;
  }

  updateDocument(
    documentId: string,
    updates: Partial<DocumentRecord>,
  ): DocumentRecord | null {
    if (!this.db) throw new Error("Database not initialized");

    const existing = this.getDocumentById(documentId);
    if (!existing) return null;

    const updatedFields = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      UPDATE documents
      SET title = ?, description = ?, category = ?, status = ?, updated_at = ?, current_version_id = ?, latest_content = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedFields.title,
      updatedFields.description,
      updatedFields.category,
      updatedFields.status,
      updatedFields.updatedAt,
      updatedFields.currentVersionId || null,
      updatedFields.latestContent || "",
      documentId,
    );

    return { ...existing, ...updates, versions: existing.versions } as DocumentRecord & {
      versions?: DocumentVersion[];
    };
  }

  deleteDocument(documentId: string): boolean {
    if (!this.db) throw new Error("Database not initialized");

    const deleteVersions = this.db.prepare(
      "DELETE FROM document_versions WHERE document_id = ?",
    );
    deleteVersions.run(documentId);

    const deleteDoc = this.db.prepare("DELETE FROM documents WHERE id = ?");
    const result = deleteDoc.run(documentId);

    return result.changes > 0;
  }

  // -- Version queries ----------------------------------------------------

  getDocumentVersions(documentId: string): DocumentVersion[] {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = this.db.prepare(
      "SELECT * FROM document_versions WHERE document_id = ? ORDER BY timestamp DESC",
    );
    const versions = stmt.all(documentId) as DocumentVersion[];

    return versions.map((v) => ({
      ...v,
      metadata: typeof v.metadata === "string"
        ? JSON.parse(v.metadata)
        : v.metadata,
    }));
  }

  addVersion(
    documentId: string,
    version: Omit<DocumentVersion, "id" | "timestamp">,
  ): DocumentVersion {
    if (!this.db) throw new Error("Database not initialized");

    const versionId = `v${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO document_versions (id, document_id, timestamp, project_id, title, content, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      versionId,
      documentId,
      timestamp,
      version.projectId || null,
      version.title || null,
      version.content || "",
      version.status,
      JSON.stringify(version.metadata || {}),
    );

    const updateDoc = this.db.prepare(
      "UPDATE documents SET current_version_id = ?, latest_content = ?, updated_at = ? WHERE id = ?",
    );
    updateDoc.run(versionId, version.content || "", timestamp, documentId);

    return {
      id: versionId,
      documentId,
      timestamp,
      ...version,
    } as DocumentVersion;
  }

  updateDocumentStatus(
    documentId: string,
    status: string,
  ): DocumentRecord | null {
    return this.updateDocument(documentId, { status } as Partial<DocumentRecord>);
  }
}
