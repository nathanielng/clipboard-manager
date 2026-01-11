import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
  BatchWriteCommand
} from '@aws-sdk/lib-dynamodb';
import { ClipboardEntry, StorageProvider } from './StorageProvider.js';

export class DynamoDBStorage implements StorageProvider {
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string = 'ClipboardEntries', region?: string) {
    this.tableName = tableName;

    this.client = new DynamoDBClient({
      region: region || process.env.AWS_REGION || 'us-east-1'
    });

    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true
      }
    });
  }

  async initialize(): Promise<void> {
    // DynamoDB doesn't need initialization - table should be created via IaC or AWS Console
    console.log(`✓ DynamoDB storage initialized (table: ${this.tableName})`);
  }

  async getAll(limit: number = 100, offset: number = 0): Promise<{ entries: ClipboardEntry[]; total: number }> {
    // Note: DynamoDB doesn't support traditional offset pagination
    // This is a simplified implementation. For production, use LastEvaluatedKey
    const command = new ScanCommand({
      TableName: this.tableName,
      Limit: limit + offset
    });

    const response = await this.docClient.send(command);
    const items = (response.Items || []) as ClipboardEntry[];

    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Manual offset (not ideal for large datasets)
    const paginatedItems = items.slice(offset, offset + limit);

    return {
      entries: paginatedItems,
      total: response.Count || 0
    };
  }

  async getById(id: string): Promise<ClipboardEntry | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id }
    });

    const response = await this.docClient.send(command);
    return (response.Item as ClipboardEntry) || null;
  }

  async create(data: { content: string; device?: string; userId?: string }): Promise<ClipboardEntry> {
    const entry: ClipboardEntry = {
      id: this.generateId(),
      content: data.content,
      createdAt: new Date().toISOString(),
      device: data.device || null,
      userId: data.userId || null
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: entry
    });

    await this.docClient.send(command);
    return entry;
  }

  async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id }
    });

    await this.docClient.send(command);
  }

  async deleteAll(): Promise<void> {
    // Scan all items and delete them
    const scanCommand = new ScanCommand({
      TableName: this.tableName,
      ProjectionExpression: 'id'
    });

    const response = await this.docClient.send(scanCommand);
    const items = response.Items || [];

    if (items.length === 0) return;

    // Batch delete (max 25 items per batch)
    const batches = [];
    for (let i = 0; i < items.length; i += 25) {
      batches.push(items.slice(i, i + 25));
    }

    for (const batch of batches) {
      const command = new BatchWriteCommand({
        RequestItems: {
          [this.tableName]: batch.map(item => ({
            DeleteRequest: {
              Key: { id: item.id }
            }
          }))
        }
      });

      await this.docClient.send(command);
    }
  }

  async search(query: string, limit: number = 50): Promise<ClipboardEntry[]> {
    // DynamoDB doesn't support LIKE queries
    // We need to scan and filter (not ideal for large datasets)
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'contains(content, :query)',
      ExpressionAttributeValues: {
        ':query': query
      },
      Limit: limit
    });

    const response = await this.docClient.send(command);
    const items = (response.Items || []) as ClipboardEntry[];

    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return items;
  }

  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}${randomPart}`;
  }

  // Batch write for sync
  async batchWrite(entries: ClipboardEntry[]): Promise<void> {
    if (entries.length === 0) return;

    const batches = [];
    for (let i = 0; i < entries.length; i += 25) {
      batches.push(entries.slice(i, i + 25));
    }

    for (const batch of batches) {
      const command = new BatchWriteCommand({
        RequestItems: {
          [this.tableName]: batch.map(entry => ({
            PutRequest: {
              Item: entry
            }
          }))
        }
      });

      await this.docClient.send(command);
    }
  }

  // Get all entries for sync
  async getAllEntries(): Promise<ClipboardEntry[]> {
    const command = new ScanCommand({
      TableName: this.tableName
    });

    const response = await this.docClient.send(command);
    return (response.Items || []) as ClipboardEntry[];
  }
}
