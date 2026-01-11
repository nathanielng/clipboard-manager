// Storage abstraction interface for clipboard entries

export interface ClipboardEntry {
  id: string;
  content: string;
  createdAt: string;
  userId?: string | null;
  device?: string | null;
}

export interface StorageProvider {
  // Get all entries with pagination
  getAll(limit?: number, offset?: number): Promise<{ entries: ClipboardEntry[]; total: number }>;

  // Get a single entry by ID
  getById(id: string): Promise<ClipboardEntry | null>;

  // Create a new entry
  create(data: { content: string; device?: string; userId?: string }): Promise<ClipboardEntry>;

  // Delete an entry by ID
  delete(id: string): Promise<void>;

  // Delete all entries
  deleteAll(): Promise<void>;

  // Search entries by content
  search(query: string, limit?: number): Promise<ClipboardEntry[]>;

  // Sync with remote storage (for JSON -> DynamoDB sync)
  sync?(): Promise<void>;

  // Initialize the storage
  initialize(): Promise<void>;
}
