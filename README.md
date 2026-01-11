# 📋 Clipboard Manager

A full-stack clipboard manager application that tracks everything you copy and paste with timestamps. Works seamlessly on both mobile phones and desktop browsers with flexible storage options: **JSON file for local deployment** and **DynamoDB for AWS cloud deployment**.

## ✨ Features

- 📝 **Copy/Paste Tracking** - Save any text content with a single click
- ⏰ **Automatic Timestamps** - Every entry is timestamped when created
- 📱 **Cross-Platform** - Works on mobile and desktop browsers (Progressive Web App)
- 💾 **Flexible Storage** - JSON file (local) or DynamoDB (AWS cloud)
- 🔄 **Sync Functionality** - Optional sync between local JSON and DynamoDB
- 🔍 **Search Functionality** - Quickly find content in your clipboard history
- 🎨 **Modern UI** - Clean, responsive design that works everywhere
- 📊 **Device Tracking** - See which device each entry came from
- 🗑️ **Easy Management** - Delete individual entries or clear entire history
- ⚡ **Lightweight** - No heavy database required for local use

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **AWS SDK** - DynamoDB integration (optional)
- **TypeScript** - Type safety and better DX
- **Storage Abstraction** - Pluggable storage providers

### Storage Options
- **JSON File** - Simple, lightweight local storage (default)
- **Amazon DynamoDB** - Serverless NoSQL for cloud deployment
- **Sync API** - Bi-directional sync between storage types

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type safety
- **PWA Support** - Works as a Progressive Web App
- **Responsive CSS** - Mobile-first design

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- That's it! No database required for local use

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clipboard-manager
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

Your clipboard history is automatically saved to `backend/data/clipboard-data.json`

### Optional: Using DynamoDB (AWS Cloud Storage)

If you want to use AWS DynamoDB instead of local JSON storage:

1. **Set up DynamoDB table**
   ```bash
   cd backend
   npm run setup:dynamodb
   ```

2. **Configure environment**
   ```bash
   # backend/.env
   STORAGE_TYPE=dynamodb
   DYNAMODB_TABLE_NAME=ClipboardEntries
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

3. **Restart the backend**

See [STORAGE_GUIDE.md](./STORAGE_GUIDE.md) for detailed storage configuration options.

## 📖 Usage

### Adding Clipboard Entries

1. **Manual Entry**: Type or paste content into the textarea
2. **Paste Button**: Click "Paste from Clipboard" to auto-paste (requires clipboard permissions)
3. **Save**: Click "Save to History" to store the entry

### Viewing History

- All entries are displayed in reverse chronological order (newest first)
- Each entry shows:
  - 🕒 Timestamp (relative time, e.g., "5m ago", "2h ago")
  - 📱/💻 Device type (Mobile or Desktop)
  - Full content (expandable if long)

### Managing Entries

- **Copy**: Click the 📋 icon to copy content back to your clipboard
- **Delete**: Click the 🗑️ icon to delete a single entry
- **Search**: Use the search bar to filter entries by content
- **Clear All**: Remove all clipboard history at once
- **Refresh**: Reload the latest entries from the database

## 🔧 Development

### Project Structure

```
clipboard-manager/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── storage/        # Storage abstraction layer
│   │   │   ├── StorageProvider.ts      # Interface
│   │   │   ├── JsonFileStorage.ts      # Local JSON storage
│   │   │   ├── DynamoDBStorage.ts      # AWS DynamoDB storage
│   │   │   ├── StorageFactory.ts       # Factory pattern
│   │   │   └── SyncService.ts          # JSON ↔ DynamoDB sync
│   │   ├── scripts/
│   │   │   └── setup-dynamodb.ts       # DynamoDB table setup
│   │   └── index.ts        # API endpoints
│   ├── data/               # Local JSON storage (auto-created)
│   │   └── clipboard-data.json
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.ts      # Vite + PWA config
├── docker-compose.full.yml  # Full-stack Docker setup
├── STORAGE_GUIDE.md         # Storage configuration guide
└── package.json            # Root scripts
```

### Available Scripts

#### Root Directory
- `npm run dev` - Start both frontend and backend in development mode
- `npm run setup` - Install all dependencies
- `npm run build` - Build both frontend and backend

#### Backend (`cd backend`)
- `npm run dev` - Start API server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run setup:dynamodb` - Create DynamoDB table (if using AWS)

#### Frontend (`cd frontend`)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

#### Backend (`.env`)

**For JSON File Storage (Default):**
```bash
STORAGE_TYPE=json
DATA_DIR=./data
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**For DynamoDB Storage (AWS):**
```bash
STORAGE_TYPE=dynamodb
DYNAMODB_TABLE_NAME=ClipboardEntries
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

**For Hybrid (JSON + DynamoDB Sync):**
```bash
# Keep using JSON locally
STORAGE_TYPE=json
DATA_DIR=./data

# Add AWS credentials for sync API
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DYNAMODB_TABLE_NAME=ClipboardEntries
```

#### Frontend (`.env`)
```bash
VITE_API_URL=  # Leave empty for development proxy
```

## 💾 Data Model

Clipboard entries use the same structure across all storage types:

```typescript
interface ClipboardEntry {
  id: string;              // Unique identifier (cuid-like)
  content: string;         // The clipboard text content
  createdAt: string;       // ISO timestamp
  userId?: string | null;  // Optional: for multi-user support
  device?: string | null;  // "Mobile" or "Desktop"
}
```

**JSON File Storage:** Stored as an array in `data/clipboard-data.json`
```json
{
  "entries": [
    {
      "id": "clxyz123abc",
      "content": "Hello World",
      "createdAt": "2026-01-11T10:30:00.000Z",
      "device": "Desktop"
    }
  ]
}
```

**DynamoDB Storage:** Each entry is a separate item in the table
- Partition Key: `id` (String)
- No secondary indexes needed (uses Scan for queries)

## 🌐 API Endpoints

### GET `/api/health`
Health check endpoint
- Returns: `{ status: "ok", timestamp: string, storage: "json" | "dynamodb" }`

### GET `/api/clipboard`
Get all clipboard entries (with pagination)
- Query params: `limit`, `offset`
- Returns: `{ entries: ClipboardEntry[], total: number, limit: number, offset: number }`

### GET `/api/clipboard/:id`
Get a single entry by ID
- Returns: `ClipboardEntry` or 404

### POST `/api/clipboard`
Create a new clipboard entry
- Body: `{ content: string, device?: string }`
- Returns: `ClipboardEntry`

### DELETE `/api/clipboard/:id`
Delete a single entry
- Returns: `{ message: "Entry deleted successfully" }`

### DELETE `/api/clipboard`
Clear all entries
- Returns: `{ message: "All entries deleted successfully" }`

### GET `/api/clipboard/search/:query`
Search entries by content
- Query params: `limit`
- Returns: `ClipboardEntry[]`

### POST `/api/sync` 🆕
Sync between JSON and DynamoDB storage
- Body: `{ direction: "upload" | "download" | "bidirectional" }`
- Requires AWS credentials configured
- Returns: `{ success: true, uploaded?: number, downloaded?: number, skipped?: number }`

**Sync Directions:**
- `upload` - Local JSON → DynamoDB
- `download` - DynamoDB → Local JSON
- `bidirectional` - Merge both ways (most recent wins)

## 📱 Progressive Web App (PWA)

The application is PWA-enabled, meaning:

- **Install on Mobile**: Add to home screen on iOS/Android
- **Install on Desktop**: Install as standalone app on Chrome/Edge
- **Offline Support**: Basic caching for improved performance
- **App-like Experience**: Full-screen mode, no browser chrome

## 🐳 Docker Deployment

### Full-Stack Deployment (Frontend + Backend)

Deploy the entire application in containers with persistent JSON storage:

```bash
# Build and start all services
docker-compose -f docker-compose.full.yml up -d --build

# View logs
docker-compose -f docker-compose.full.yml logs -f

# Stop all services
docker-compose -f docker-compose.full.yml down

# Stop and remove all data (including clipboard history)
docker-compose -f docker-compose.full.yml down -v
```

**What's included:**
- ✅ Backend API (Node.js + Express)
- ✅ Frontend (React + Nginx)
- ✅ Persistent JSON storage (Docker volume)
- ✅ Health checks for all services
- ✅ Automatic restarts

**Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

**Data persistence:**
- Clipboard history stored in Docker volume `clipboard-data`
- Data survives container restarts
- Located at `/app/data/clipboard-data.json` inside container

### Docker with DynamoDB

To use DynamoDB instead of JSON storage in Docker:

```bash
# Edit docker-compose.full.yml
# Change environment variables in backend service:
environment:
  STORAGE_TYPE: dynamodb
  DYNAMODB_TABLE_NAME: ClipboardEntries
  AWS_REGION: us-east-1
  AWS_ACCESS_KEY_ID: your-key
  AWS_SECRET_ACCESS_KEY: your-secret
```

This is ideal for:
- ✅ Quick testing without installing Node.js
- ✅ Consistent environment across different machines
- ✅ Easy deployment to container platforms
- ✅ Zero database setup required

## 🚀 Deployment Instructions

### 💻 Local Desktop Deployment (Production Build)

For running the application as a production build on your local desktop:

#### 1. Build the Application

```bash
# Install all dependencies
npm run setup

# Build both frontend and backend
npm run build
```

#### 2. Configure Environment

Create `backend/.env`:
```bash
STORAGE_TYPE=json
DATA_DIR=./data
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost:4173
```

Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:3001/api
```

#### 3. Run Production Server

**Option A: Using PM2 (Recommended for background processes)**
```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start dist/index.js --name clipboard-backend

# Serve frontend (using serve)
cd ../frontend
npm install -g serve
pm2 start "serve -s dist -l 4173" --name clipboard-frontend

# View logs
pm2 logs

# Stop services
pm2 stop all

# Restart services
pm2 restart all
```

**Option B: Manual Start**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend (using serve)
cd frontend
npx serve -s dist -l 4173
```

#### 6. Access Application

- Frontend: http://localhost:4173
- Backend API: http://localhost:3001

#### 7. Auto-start on System Boot (Optional)

**macOS/Linux with PM2:**
```bash
pm2 startup
pm2 save
```

**Windows - Create batch file `start-clipboard.bat`:**
```batch
@echo off
cd /d C:\path\to\clipboard-manager\backend
start "Backend" cmd /k npm start

cd /d C:\path\to\clipboard-manager\frontend
start "Frontend" cmd /k npx serve -s dist -l 4173
```

---

### ☁️ AWS Deployment

Deploy the clipboard manager to AWS with the following setup:
- **Frontend**: S3 + CloudFront (CDN)
- **Backend**: EC2 or Lambda
- **Storage**: DynamoDB (serverless NoSQL)

#### Prerequisites

- AWS CLI installed and configured
- AWS account with appropriate permissions
- Domain name (optional, but recommended for HTTPS)

**💰 Estimated Cost:** ~$1-3/month (vs ~$24-35/month with RDS)

---

### Option 1: EC2 + DynamoDB Deployment (Simplest)

#### Step 1: Create DynamoDB Table

```bash
# Using AWS CLI (On-Demand billing - recommended)
aws dynamodb create-table \
  --table-name ClipboardEntries \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 \
  --tags Key=Application,Value=ClipboardManager

# Or use AWS Console:
# 1. Go to DynamoDB Console
# 2. Create Table
# 3. Table name: ClipboardEntries
# 4. Partition key: id (String)
# 5. Billing mode: On-Demand
# 6. Create table

# Or use the setup script from your backend:
cd backend
npm install
npm run setup:dynamodb -- --on-demand
```

#### Step 2: Launch EC2 Instance

```bash
# Launch Ubuntu EC2 instance (t3.micro for free tier)
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=clipboard-manager}]'

# Or use AWS Console:
# 1. Launch EC2 instance with Ubuntu 22.04
# 2. Instance type: t3.micro (free tier)
# 3. Configure security group:
#    - Port 22 (SSH) - Your IP only
#    - Port 3001 (Backend API) - Anywhere or specific IPs
#    - Port 80 (HTTP) - Anywhere
#    - Port 443 (HTTPS) - Anywhere
```

#### Step 3: Set Up EC2 Instance

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-username/clipboard-manager.git
cd clipboard-manager
```

#### Step 4: Configure Backend on EC2

```bash
cd ~/clipboard-manager

# Install dependencies
npm run setup

# Configure backend environment
cat > backend/.env << EOF
STORAGE_TYPE=dynamodb
DYNAMODB_TABLE_NAME=ClipboardEntries
AWS_REGION=us-east-1
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
EOF

# Build backend
cd backend
npm run build

# Start backend with PM2
# Note: EC2 instance should have IAM role with DynamoDB permissions
# Or you can set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env
pm2 start dist/index.js --name clipboard-backend
pm2 startup
pm2 save

# Check logs
pm2 logs clipboard-backend
```

**IAM Permissions for EC2:**

Attach an IAM role to your EC2 instance with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/ClipboardEntries"
    }
  ]
}
```

#### Step 5: Set Up Nginx as Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Configure Nginx
sudo tee /etc/nginx/sites-available/clipboard-manager << EOF
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/clipboard-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 6: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

#### Step 7: Deploy Frontend to S3 + CloudFront

```bash
# On your local machine, build frontend
cd frontend

# Configure production environment
cat > .env << EOF
VITE_API_URL=https://your-domain.com/api
EOF

# Build frontend
npm run build

# Create S3 bucket
aws s3 mb s3://clipboard-manager-frontend --region us-east-1

# Configure bucket for static website hosting
aws s3 website s3://clipboard-manager-frontend --index-document index.html --error-document index.html

# Upload built files
aws s3 sync dist/ s3://clipboard-manager-frontend --delete

# Make bucket public (use bucket policy)
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::clipboard-manager-frontend/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket clipboard-manager-frontend --policy file://bucket-policy.json
```

#### Step 8: Set Up CloudFront Distribution

```bash
# Using AWS Console (recommended):
# 1. Go to CloudFront Console
# 2. Create Distribution
# 3. Origin Domain: clipboard-manager-frontend.s3.amazonaws.com
# 4. Viewer Protocol Policy: Redirect HTTP to HTTPS
# 5. Default Root Object: index.html
# 6. Create custom error response: 404 -> /index.html (for SPA routing)
# 7. (Optional) Add your custom domain and SSL certificate

# Or using AWS CLI:
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

#### Step 9: Update CORS Settings

Update `backend/.env` on EC2:
```bash
CORS_ORIGIN=https://your-cloudfront-domain.cloudfront.net
```

Restart backend:
```bash
pm2 restart clipboard-backend
```

---

### Option 2: ECS Fargate + DynamoDB Deployment (More Scalable)

#### Step 1: Create DynamoDB Table (Same as Option 1)

Use the DynamoDB setup from Option 1, Step 1.

#### Step 2: Build and Push Docker Image to ECR

The `backend/Dockerfile` is already included in the repository.

Build and push to ECR:

```bash
# Create ECR repository
aws ecr create-repository --repository-name clipboard-manager-backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
cd backend
docker build -t clipboard-manager-backend .

# Tag image
docker tag clipboard-manager-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/clipboard-manager-backend:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/clipboard-manager-backend:latest
```

#### Step 4: Create ECS Cluster and Task Definition

Using AWS Console:
1. Go to ECS Console
2. Create Cluster (Fargate)
3. Create Task Definition:
   - Launch type: Fargate
   - Task memory: 512 MB
   - Task CPU: 0.25 vCPU
   - Container: Use ECR image
   - Port mapping: 3001
   - Environment variables:
     - `DATABASE_URL`
     - `PORT=3001`
     - `NODE_ENV=production`
     - `CORS_ORIGIN`

4. Create Service:
   - Launch type: Fargate
   - Desired tasks: 1 (or more for HA)
   - Load balancer: Application Load Balancer
   - Target group: Create new, port 3001

#### Step 5: Configure Application Load Balancer

1. Create ALB with HTTPS listener
2. Add SSL certificate from ACM
3. Configure health check: `/api/health`
4. Update security groups

#### Step 6: Deploy Frontend (Same as Option 1, Step 7-8)

---

### 📊 Cost Estimation (AWS)

**Option 1: EC2 + DynamoDB** ⭐ Most Cost-Effective
- EC2 t3.micro: ~$8-10/month (or free tier)
- DynamoDB On-Demand: ~$0.25-1/month (typical personal use)
- S3 + CloudFront: ~$1-2/month (depending on traffic)
- **Total: ~$9-13/month** (or ~$1-3/month on free tier)

**Option 2: ECS Fargate + DynamoDB**
- Fargate (0.25 vCPU, 512 MB): ~$12/month
- DynamoDB On-Demand: ~$0.25-1/month
- S3 + CloudFront: ~$1-2/month
- ALB: ~$18/month
- **Total: ~$31-33/month**

**💰 Savings vs PostgreSQL RDS:**
- Option 1: Save ~$15-22/month (60-65% cheaper)
- Option 2: Save ~$13-22/month (40% cheaper)

**DynamoDB Pricing Details:**
- First 25 GB storage: Free
- On-Demand: $1.25 per million writes, $0.25 per million reads
- For 1,000 clipboard entries/month: ~$0.01-0.05/month
- Backup: Point-in-time recovery adds ~$0.20/month per GB

---

### 🔍 Post-Deployment Checklist

- [ ] DynamoDB table created with On-Demand billing
- [ ] IAM roles/permissions configured for DynamoDB access
- [ ] SSL/HTTPS enabled for all endpoints
- [ ] Environment variables secured (never commit `.env`)
- [ ] Monitoring set up (CloudWatch, EC2/ECS metrics, DynamoDB metrics)
- [ ] Log aggregation configured (CloudWatch Logs)
- [ ] Security groups properly configured (least privilege)
- [ ] CORS settings updated for production domain
- [ ] Rate limiting implemented (consider AWS WAF)
- [ ] Auto-scaling configured (for ECS option)
- [ ] DynamoDB backup enabled (Point-in-time recovery)
- [ ] Domain DNS configured (Route 53 or your provider)
- [ ] Test sync functionality if using hybrid approach

## 🔒 Security Notes

- Currently single-user (no authentication)
- Clipboard API requires HTTPS in production (except localhost)
- Add authentication before deploying to production
- Consider rate limiting for production use
- For AWS deployments:
  - Use AWS Secrets Manager for sensitive credentials
  - Enable AWS WAF for DDoS protection
  - Use IAM roles instead of access keys when possible
  - Enable DynamoDB encryption at rest (enabled by default)
  - Enable Point-in-time Recovery for DynamoDB
  - Regularly update dependencies and security patches
  - Implement AWS CloudTrail for audit logging
  - Use VPC endpoints for DynamoDB (more secure, lower cost)

## 🚧 Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Clipboard categories/tags
- [ ] Export clipboard history (CSV, JSON)
- [ ] Browser extension for automatic clipboard capture
- [ ] End-to-end encryption for sensitive content
- [ ] Collaborative clipboard sharing
- [ ] Rich text and image support

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Tips

- **Clipboard Permissions**: Some browsers require explicit permission to read clipboard. Grant when prompted or paste manually.
- **Mobile Use**: Add to home screen for best mobile experience
- **Search**: Search is case-insensitive and searches through all content
- **Timestamps**: Hover over timestamps to see exact date/time

---

Built with ❤️ using React, Node.js, and PostgreSQL