import { StorageProvider } from './StorageProvider.js';
import { JsonFileStorage } from './JsonFileStorage.js';
import { DynamoDBStorage } from './DynamoDBStorage.js';

export type StorageType = 'json' | 'dynamodb';

export class StorageFactory {
  static create(type: StorageType = 'json'): StorageProvider {
    switch (type) {
      case 'json':
        const dataDir = process.env.DATA_DIR || './data';
        return new JsonFileStorage(dataDir);

      case 'dynamodb':
        const tableName = process.env.DYNAMODB_TABLE_NAME || 'ClipboardEntries';
        const region = process.env.AWS_REGION || 'us-east-1';
        return new DynamoDBStorage(tableName, region);

      default:
        throw new Error(`Unknown storage type: ${type}`);
    }
  }

  static getStorageType(): StorageType {
    const type = process.env.STORAGE_TYPE || 'json';
    if (type !== 'json' && type !== 'dynamodb') {
      console.warn(`Invalid STORAGE_TYPE "${type}", defaulting to "json"`);
      return 'json';
    }
    return type;
  }
}
