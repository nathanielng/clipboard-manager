import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all clipboard entries (with pagination)
app.get('/api/clipboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const entries = await prisma.clipboardEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.clipboardEntry.count();

    res.json({
      entries,
      total,
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
    const entry = await prisma.clipboardEntry.findUnique({
      where: { id }
    });

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

    const entry = await prisma.clipboardEntry.create({
      data: {
        content,
        device: device || null
      }
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

    await prisma.clipboardEntry.delete({
      where: { id }
    });

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting clipboard entry:', error);
    res.status(500).json({ error: 'Failed to delete clipboard entry' });
  }
});

// Clear all clipboard entries
app.delete('/api/clipboard', async (req, res) => {
  try {
    await prisma.clipboardEntry.deleteMany({});
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

    const entries = await prisma.clipboardEntry.findMany({
      where: {
        content: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json(entries);
  } catch (error) {
    console.error('Error searching clipboard entries:', error);
    res.status(500).json({ error: 'Failed to search clipboard entries' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints available at http://localhost:${PORT}/api`);
});
