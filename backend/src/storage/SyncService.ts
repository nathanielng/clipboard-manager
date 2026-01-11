import { JsonFileStorage } from './JsonFileStorage.js';
import { DynamoDBStorage } from './DynamoDBStorage.js';
import { ClipboardEntry } from './StorageProvider.js';

export class SyncService {
  constructor(
    private jsonStorage: JsonFileStorage,
    private dynamoStorage: DynamoDBStorage
  ) {}

  /**
   * Sync local JSON storage to DynamoDB
   * Strategy: Merge based on ID, keep most recent version
   */
  async syncJsonToDynamoDB(): Promise<{ uploaded: number; skipped: number }> {
    console.log('Starting JSON → DynamoDB sync...');

    // Get all entries from both storages
    const [jsonEntries, dynamoEntries] = await Promise.all([
      this.jsonStorage.getAllEntries(),
      this.dynamoStorage.getAllEntries()
    ]);

    // Create a map of DynamoDB entries for quick lookup
    const dynamoMap = new Map(dynamoEntries.map(e => [e.id, e]));

    // Find entries that need to be uploaded
    const toUpload: ClipboardEntry[] = [];
    const toSkip: string[] = [];

    for (const jsonEntry of jsonEntries) {
      const dynamoEntry = dynamoMap.get(jsonEntry.id);

      if (!dynamoEntry) {
        // Entry doesn't exist in DynamoDB, upload it
        toUpload.push(jsonEntry);
      } else {
        // Entry exists, check if local is newer
        const jsonTime = new Date(jsonEntry.createdAt).getTime();
        const dynamoTime = new Date(dynamoEntry.createdAt).getTime();

        if (jsonTime > dynamoTime) {
          toUpload.push(jsonEntry);
        } else {
          toSkip.push(jsonEntry.id);
        }
      }
    }

    // Upload entries to DynamoDB
    if (toUpload.length > 0) {
      await this.dynamoStorage.batchWrite(toUpload);
    }

    console.log(`✓ Sync complete: ${toUpload.length} uploaded, ${toSkip.length} skipped`);

    return {
      uploaded: toUpload.length,
      skipped: toSkip.length
    };
  }

  /**
   * Sync DynamoDB to local JSON storage
   * Useful for backing up cloud data locally
   */
  async syncDynamoDBToJson(): Promise<{ downloaded: number; skipped: number }> {
    console.log('Starting DynamoDB → JSON sync...');

    const [jsonEntries, dynamoEntries] = await Promise.all([
      this.jsonStorage.getAllEntries(),
      this.dynamoStorage.getAllEntries()
    ]);

    const jsonMap = new Map(jsonEntries.map(e => [e.id, e]));

    const toDownload: ClipboardEntry[] = [];
    const toSkip: string[] = [];

    for (const dynamoEntry of dynamoEntries) {
      const jsonEntry = jsonMap.get(dynamoEntry.id);

      if (!jsonEntry) {
        toDownload.push(dynamoEntry);
      } else {
        const jsonTime = new Date(jsonEntry.createdAt).getTime();
        const dynamoTime = new Date(dynamoEntry.createdAt).getTime();

        if (dynamoTime > jsonTime) {
          toDownload.push(dynamoEntry);
        } else {
          toSkip.push(dynamoEntry.id);
        }
      }
    }

    // Add new entries to JSON
    if (toDownload.length > 0) {
      const allEntries = [...jsonEntries];

      for (const entry of toDownload) {
        const existingIndex = allEntries.findIndex(e => e.id === entry.id);
        if (existingIndex >= 0) {
          allEntries[existingIndex] = entry;
        } else {
          allEntries.push(entry);
        }
      }

      await this.jsonStorage.setAllEntries(allEntries);
    }

    console.log(`✓ Sync complete: ${toDownload.length} downloaded, ${toSkip.length} skipped`);

    return {
      downloaded: toDownload.length,
      skipped: toSkip.length
    };
  }

  /**
   * Bi-directional sync (merge both ways)
   */
  async bidirectionalSync(): Promise<{
    uploaded: number;
    downloaded: number;
    conflicts: number;
  }> {
    console.log('Starting bi-directional sync...');

    const [jsonEntries, dynamoEntries] = await Promise.all([
      this.jsonStorage.getAllEntries(),
      this.dynamoStorage.getAllEntries()
    ]);

    const jsonMap = new Map(jsonEntries.map(e => [e.id, e]));
    const dynamoMap = new Map(dynamoEntries.map(e => [e.id, e]));

    const toUpload: ClipboardEntry[] = [];
    const toDownload: ClipboardEntry[] = [];
    let conflicts = 0;

    // Check all JSON entries
    for (const jsonEntry of jsonEntries) {
      const dynamoEntry = dynamoMap.get(jsonEntry.id);

      if (!dynamoEntry) {
        toUpload.push(jsonEntry);
      } else {
        const jsonTime = new Date(jsonEntry.createdAt).getTime();
        const dynamoTime = new Date(dynamoEntry.createdAt).getTime();

        if (jsonTime > dynamoTime) {
          toUpload.push(jsonEntry);
          conflicts++;
        } else if (dynamoTime > jsonTime) {
          toDownload.push(dynamoEntry);
          conflicts++;
        }
      }
    }

    // Check for DynamoDB entries not in JSON
    for (const dynamoEntry of dynamoEntries) {
      if (!jsonMap.has(dynamoEntry.id)) {
        toDownload.push(dynamoEntry);
      }
    }

    // Perform sync
    if (toUpload.length > 0) {
      await this.dynamoStorage.batchWrite(toUpload);
    }

    if (toDownload.length > 0) {
      const allEntries = [...jsonEntries];

      for (const entry of toDownload) {
        const existingIndex = allEntries.findIndex(e => e.id === entry.id);
        if (existingIndex >= 0) {
          allEntries[existingIndex] = entry;
        } else {
          allEntries.push(entry);
        }
      }

      await this.jsonStorage.setAllEntries(allEntries);
    }

    console.log(`✓ Bi-directional sync complete: ${toUpload.length} uploaded, ${toDownload.length} downloaded, ${conflicts} conflicts resolved`);

    return {
      uploaded: toUpload.length,
      downloaded: toDownload.length,
      conflicts
    };
  }
}
