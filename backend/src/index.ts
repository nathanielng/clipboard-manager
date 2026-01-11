import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StorageFactory } from './storage/StorageFactory.js';
import { StorageProvider } from './storage/StorageProvider.js';
import { JsonFileStorage } from './storage/JsonFileStorage.js';
import { DynamoDBStorage } from './storage/DynamoDBStorage.js';
import { SyncService } from './storage/SyncService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize storage
const storageType = StorageFactory.getStorageType();
const storage: StorageProvider = StorageFactory.create(storageType);

console.log(`📦 Using storage type: ${storageType.toUpperCase()}`);

// Initialize storage on startup
await storage.initialize();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    storage: storageType
  });
});

// Get all clipboard entries (with pagination)
app.get('/api/clipboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await storage.getAll(limit, offset);

    res.json({
      entries: result.entries,
      total: result.total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching clipboard entries:', error);
    res.status(500).json({ error: 'Failed to fetch clipboard entries' });
  }
});

// Get a single clipboard entry
app.get('/api/clipboard/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await storage.getById(id);

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error fetching clipboard entry:', error);
    res.status(500).json({ error: 'Failed to fetch clipboard entry' });
  }
});

// Create a new clipboard entry
app.post('/api/clipboard', async (req, res) => {
  try {
    const { content, device } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required and must be a string' });
    }

    const entry = await storage.create({
      content,
      device: device || undefined
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating clipboard entry:', error);
    res.status(500).json({ error: 'Failed to create clipboard entry' });
  }
});

// Delete a clipboard entry
app.delete('/api/clipboard/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await storage.delete(id);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting clipboard entry:', error);
    res.status(500).json({ error: 'Failed to delete clipboard entry' });
  }
});

// Clear all clipboard entries
app.delete('/api/clipboard', async (req, res) => {
  try {
    await storage.deleteAll();
    res.json({ message: 'All entries deleted successfully' });
  } catch (error) {
    console.error('Error clearing clipboard entries:', error);
    res.status(500).json({ error: 'Failed to clear clipboard entries' });
  }
});

// Search clipboard entries
app.get('/api/clipboard/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const entries = await storage.search(query, limit);
    res.json(entries);
  } catch (error) {
    console.error('Error searching clipboard entries:', error);
    res.status(500).json({ error: 'Failed to search clipboard entries' });
  }
});

// Sync endpoint - sync JSON to DynamoDB
app.post('/api/sync', async (req, res) => {
  try {
    const { direction = 'upload' } = req.body;

    // Check if sync is available (requires both JSON and DynamoDB configs)
    const hasDynamoDBConfig = process.env.AWS_REGION &&
                             (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE);

    if (!hasDynamoDBConfig) {
      return res.status(400).json({
        error: 'DynamoDB credentials not configured',
        hint: 'Set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY'
      });
    }

    // Create storage instances for sync
    const jsonStorage = new JsonFileStorage(process.env.DATA_DIR || './data');
    const dynamoStorage = new DynamoDBStorage(
      process.env.DYNAMODB_TABLE_NAME || 'ClipboardEntries',
      process.env.AWS_REGION
    );

    await jsonStorage.initialize();
    await dynamoStorage.initialize();

    const syncService = new SyncService(jsonStorage, dynamoStorage);

    let result;
    if (direction === 'upload') {
      result = await syncService.syncJsonToDynamoDB();
    } else if (direction === 'download') {
      result = await syncService.syncDynamoDBToJson();
    } else if (direction === 'bidirectional') {
      result = await syncService.bidirectionalSync();
    } else {
      return res.status(400).json({
        error: 'Invalid direction',
        hint: 'Use "upload", "download", or "bidirectional"'
      });
    }

    res.json({
      success: true,
      direction,
      ...result
    });
  } catch (error) {
    console.error('Error syncing clipboard entries:', error);
    res.status(500).json({
      error: 'Failed to sync clipboard entries',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`💾 Storage: ${storageType.toUpperCase()}`);
});
