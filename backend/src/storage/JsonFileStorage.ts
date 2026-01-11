import { promises as fs } from 'fs';
import { join } from 'path';
import { ClipboardEntry, StorageProvider } from './StorageProvider.js';

interface JsonData {
  entries: ClipboardEntry[];
}

export class JsonFileStorage implements StorageProvider {
  private filePath: string;
  private data: JsonData = { entries: [] };

  constructor(dataDir: string = './data') {
    this.filePath = join(dataDir, 'clipboard-data.json');
  }

  async initialize(): Promise<void> {
    try {
      // Create data directory if it doesn't exist
      const dir = join(this.filePath, '..');
      await fs.mkdir(dir, { recursive: true });

      // Try to read existing file
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      this.data = JSON.parse(fileContent);
      console.log(`✓ Loaded ${this.data.entries.length} entries from JSON file`);
    } catch (error) {
      // File doesn't exist, create it
      this.data = { entries: [] };
      await this.save();
      console.log('✓ Created new JSON storage file');
    }
  }

  private async save(): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  async getAll(limit: number = 100, offset: number = 0): Promise<{ entries: ClipboardEntry[]; total: number }> {
    const sorted = [...this.data.entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      entries: sorted.slice(offset, offset + limit),
      total: this.data.entries.length
    };
  }

  async getById(id: string): Promise<ClipboardEntry | null> {
    return this.data.entries.find(e => e.id === id) || null;
  }

  async create(data: { content: string; device?: string; userId?: string }): Promise<ClipboardEntry> {
    const entry: ClipboardEntry = {
      id: this.generateId(),
      content: data.content,
      createdAt: new Date().toISOString(),
      device: data.device || null,
      userId: data.userId || null
    };

    this.data.entries.push(entry);
    await this.save();
    return entry;
  }

  async delete(id: string): Promise<void> {
    const index = this.data.entries.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Entry not found');
    }
    this.data.entries.splice(index, 1);
    await this.save();
  }

  async deleteAll(): Promise<void> {
    this.data.entries = [];
    await this.save();
  }

  async search(query: string, limit: number = 50): Promise<ClipboardEntry[]> {
    const lowerQuery = query.toLowerCase();
    const results = this.data.entries
      .filter(e => e.content.toLowerCase().includes(lowerQuery))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return results.slice(0, limit);
  }

  // Generate a simple unique ID (cuid-like)
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}${randomPart}`;
  }

  // Get all entries for sync
  async getAllEntries(): Promise<ClipboardEntry[]> {
    return this.data.entries;
  }

  // Set all entries (used during sync)
  async setAllEntries(entries: ClipboardEntry[]): Promise<void> {
    this.data.entries = entries;
    await this.save();
  }
}
