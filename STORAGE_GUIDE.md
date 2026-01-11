# 💾 Storage Configuration Guide

The Clipboard Manager supports two storage backends with optional synchronization between them.

## Storage Options

### 1. JSON File Storage (Default - Local)

Perfect for personal use, development, and desktop deployments.

**Advantages:**
- ✅ Zero dependencies - no database required
- ✅ Extremely lightweight
- ✅ Easy to backup (just one JSON file)
- ✅ Perfect for single-user scenarios
- ✅ Works offline completely
- ✅ Fast for small to medium datasets (< 10,000 entries)

**Configuration:**
```bash
# backend/.env
STORAGE_TYPE=json
DATA_DIR=./data
```

The clipboard history is stored in `data/clipboard-data.json`.

---

### 2. DynamoDB Storage (AWS Cloud)

Ideal for cloud deployments, multi-device access, and scalability.

**Advantages:**
- ✅ Serverless - no infrastructure management
- ✅ Scales automatically
- ✅ Pay-per-use pricing
- ✅ High availability and durability
- ✅ Perfect for AWS deployments
- ✅ Great for multi-user scenarios

**Cost:** ~$0.25-2/month for typical personal use (On-Demand pricing)

**Configuration:**
```bash
# backend/.env
STORAGE_TYPE=dynamodb
DYNAMODB_TABLE_NAME=ClipboardEntries
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

---

## Setting Up DynamoDB

### Option 1: Using the Setup Script (Recommended)

```bash
cd backend

# Install dependencies first
npm install

# Create table with provisioned capacity
npm run setup:dynamodb

# Or create with on-demand billing (better for variable workloads)
npm run setup:dynamodb -- --on-demand
```

### Option 2: Using AWS Console

1. Go to DynamoDB Console
2. Create Table
3. Table name: `ClipboardEntries`
4. Partition key: `id` (String)
5. Choose billing mode:
   - **On-Demand** - Recommended for personal use
   - **Provisioned** - For predictable workloads
6. Create table

### Option 3: Using AWS CLI

```bash
aws dynamodb create-table \
  --table-name ClipboardEntries \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

---

## Sync Between JSON and DynamoDB

You can sync your local JSON file with DynamoDB to get the best of both worlds:
- Keep a local backup
- Access from anywhere via cloud
- Migrate between storage types

### Sync API Endpoint

**POST** `/api/sync`

**Request Body:**
```json
{
  "direction": "upload" | "download" | "bidirectional"
}
```

**Directions:**
- `upload` - Sync local JSON → DynamoDB
- `download` - Sync DynamoDB → local JSON
- `bidirectional` - Merge both ways (most recent wins)

### Examples

**Upload local data to DynamoDB:**
```bash
curl -X POST http://localhost:3001/api/sync \
  -H "Content-Type: application/json" \
  -d '{"direction": "upload"}'
```

**Download cloud data to local:**
```bash
curl -X POST http://localhost:3001/api/sync \
  -H "Content-Type: application/json" \
  -d '{"direction": "download"}'
```

**Bi-directional sync:**
```bash
curl -X POST http://localhost:3001/api/sync \
  -H "Content-Type: application/json" \
  -d '{"direction": "bidirectional"}'
```

---

## Migration Scenarios

### Migrating from JSON to DynamoDB

1. Keep using JSON locally: `STORAGE_TYPE=json`
2. Set up DynamoDB table (see above)
3. Configure AWS credentials in `.env`
4. Sync your data:
   ```bash
   curl -X POST http://localhost:3001/api/sync \
     -H "Content-Type: application/json" \
     -d '{"direction": "upload"}'
   ```
5. Switch to DynamoDB: `STORAGE_TYPE=dynamodb`
6. Restart your backend

### Migrating from DynamoDB to JSON

1. Keep using DynamoDB: `STORAGE_TYPE=dynamodb`
2. Download all data:
   ```bash
   curl -X POST http://localhost:3001/api/sync \
     -H "Content-Type: application/json" \
     -d '{"direction": "download"}'
   ```
3. Switch to JSON: `STORAGE_TYPE=json`
4. Restart your backend

### Using Both (Hybrid Approach)

Run locally with JSON, periodically sync to DynamoDB for backup:

```bash
# Local setup
STORAGE_TYPE=json

# Periodic backup script
#!/bin/bash
curl -X POST http://localhost:3001/api/sync \
  -H "Content-Type: application/json" \
  -d '{"direction": "upload"}'
```

Run this as a cron job for automatic cloud backups.

---

## Storage Comparison

| Feature | JSON File | DynamoDB |
|---------|-----------|----------|
| Setup complexity | ⭐ Very Easy | ⭐⭐⭐ Moderate |
| Cost | Free | ~$0.25-2/month |
| Performance (< 1K items) | ⚡ Excellent | ⚡ Excellent |
| Performance (> 10K items) | 🐌 Degrades | ⚡ Excellent |
| Scalability | Limited | Unlimited |
| Backup | Manual | Automatic |
| Multi-device | No | Yes |
| Offline access | Yes | No |
| Best for | Personal, Desktop | Cloud, Multi-device |

---

## Recommendations

**Use JSON File if:**
- Personal, single-device use
- Desktop application
- You want simplicity
- < 5,000 clipboard entries
- Offline access is important

**Use DynamoDB if:**
- Cloud deployment (AWS)
- Multi-device access needed
- Scalability is important
- Using other AWS services
- You want automated backups

**Use Sync if:**
- You want local + cloud backup
- Migrating between storage types
- Want best of both worlds
