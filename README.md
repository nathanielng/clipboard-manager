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
- **Docker** and Docker Compose (for PostgreSQL)
- Or PostgreSQL 14+ installed locally

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clipboard-manager
   ```

2. **Start PostgreSQL database**
   ```bash
   docker-compose up -d
   ```

3. **Install dependencies**
   ```bash
   npm run setup
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run db:push
   cd ..
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

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
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   └── index.ts        # API endpoints
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
├── docker-compose.yml       # PostgreSQL setup
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
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:migrate` - Create and run migrations

#### Frontend (`cd frontend`)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

#### Backend (`.env`)
```bash
DATABASE_URL="postgresql://clipboarduser:clipboardpass@localhost:5432/clipboard_manager?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (`.env`)
```bash
VITE_API_URL=  # Leave empty for development proxy
```

## 🗄️ Database Schema

```prisma
model ClipboardEntry {
  id        String   @id @default(cuid())
  content   String   @db.Text
  createdAt DateTime @default(now())
  userId    String?  // For future multi-user support
  device    String?  // Mobile or Desktop
}
```

## 🌐 API Endpoints

### GET `/api/health`
Health check endpoint

### GET `/api/clipboard`
Get all clipboard entries (with pagination)
- Query params: `limit`, `offset`

### GET `/api/clipboard/:id`
Get a single entry by ID

### POST `/api/clipboard`
Create a new clipboard entry
- Body: `{ content: string, device?: string }`

### DELETE `/api/clipboard/:id`
Delete a single entry

### DELETE `/api/clipboard`
Clear all entries

### GET `/api/clipboard/search/:query`
Search entries by content
- Query params: `limit`

## 📱 Progressive Web App (PWA)

The application is PWA-enabled, meaning:

- **Install on Mobile**: Add to home screen on iOS/Android
- **Install on Desktop**: Install as standalone app on Chrome/Edge
- **Offline Support**: Basic caching for improved performance
- **App-like Experience**: Full-screen mode, no browser chrome

## 🐳 Docker Deployment

### Database Only (Development)

The included `docker-compose.yml` provides an easy PostgreSQL setup:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Full-Stack Docker Deployment

For a complete containerized deployment (database + backend + frontend):

```bash
# Build and start all services
docker-compose -f docker-compose.full.yml up -d --build

# View logs
docker-compose -f docker-compose.full.yml logs -f

# Stop all services
docker-compose -f docker-compose.full.yml down

# Stop and remove all data
docker-compose -f docker-compose.full.yml down -v
```

After starting, access the application at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

This is ideal for:
- Quick testing without installing Node.js
- Consistent environment across different machines
- Easy deployment to container orchestration platforms

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

#### 2. Set up PostgreSQL

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Local PostgreSQL Installation**
```bash
# Install PostgreSQL 14+ on your system
# macOS
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql-16
sudo systemctl start postgresql

# Create database and user
psql postgres
CREATE DATABASE clipboard_manager;
CREATE USER clipboarduser WITH PASSWORD 'clipboardpass';
GRANT ALL PRIVILEGES ON DATABASE clipboard_manager TO clipboarduser;
\q
```

#### 3. Configure Environment

Create `backend/.env`:
```bash
DATABASE_URL="postgresql://clipboarduser:clipboardpass@localhost:5432/clipboard_manager?schema=public"
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost:4173
```

Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:3001/api
```

#### 4. Initialize Database

```bash
cd backend
npm run db:push
cd ..
```

#### 5. Run Production Server

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
- **Backend**: EC2 or ECS (Fargate)
- **Database**: RDS PostgreSQL

#### Prerequisites

- AWS CLI installed and configured
- AWS account with appropriate permissions
- Domain name (optional, but recommended for HTTPS)

---

### Option 1: EC2 + RDS Deployment (Simpler)

#### Step 1: Create RDS PostgreSQL Database

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier clipboard-manager-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username clipboardadmin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-name clipboard_manager \
  --publicly-accessible \
  --backup-retention-period 7

# Or use AWS Console:
# 1. Go to RDS Console
# 2. Create Database → PostgreSQL
# 3. Choose Free Tier (db.t3.micro)
# 4. Set master username/password
# 5. Create database name: clipboard_manager
# 6. Configure security group to allow port 5432
```

**Note the RDS endpoint** (e.g., `clipboard-manager-db.xxxxx.us-east-1.rds.amazonaws.com`)

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
DATABASE_URL="postgresql://clipboardadmin:YOUR_SECURE_PASSWORD@your-rds-endpoint.rds.amazonaws.com:5432/clipboard_manager?schema=public"
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
EOF

# Build backend
cd backend
npm run build

# Initialize database
npm run db:push

# Start backend with PM2
pm2 start dist/index.js --name clipboard-backend
pm2 startup
pm2 save

# Check logs
pm2 logs clipboard-backend
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

### Option 2: ECS Fargate + RDS Deployment (More Scalable)

#### Step 1: Create RDS Database (Same as Option 1)

#### Step 2: Create Docker Images

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["npm", "start"]
```

Create `backend/.dockerignore`:
```
node_modules
dist
.env
*.log
```

#### Step 3: Build and Push to ECR

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

**Option 1: EC2 + RDS**
- EC2 t3.micro: ~$8-10/month (or free tier)
- RDS db.t3.micro: ~$15-20/month (or free tier)
- S3 + CloudFront: ~$1-5/month (depending on traffic)
- **Total: ~$24-35/month** (or ~$1-5/month on free tier)

**Option 2: ECS Fargate + RDS**
- Fargate (0.25 vCPU, 512 MB): ~$12/month
- RDS db.t3.micro: ~$15-20/month
- S3 + CloudFront: ~$1-5/month
- ALB: ~$18/month
- **Total: ~$46-55/month**

---

### 🔍 Post-Deployment Checklist

- [ ] Database backups configured (RDS automated backups)
- [ ] SSL/HTTPS enabled for all endpoints
- [ ] Environment variables secured (never commit `.env`)
- [ ] Monitoring set up (CloudWatch, EC2/ECS metrics)
- [ ] Log aggregation configured (CloudWatch Logs)
- [ ] Security groups properly configured (least privilege)
- [ ] CORS settings updated for production domain
- [ ] Rate limiting implemented (consider AWS WAF)
- [ ] Database connection pooling configured
- [ ] Auto-scaling configured (for ECS option)
- [ ] Backup and disaster recovery plan documented
- [ ] Domain DNS configured (Route 53 or your provider)

## 🔒 Security Notes

- Currently single-user (no authentication)
- Clipboard API requires HTTPS in production (except localhost)
- Add authentication before deploying to production
- Consider rate limiting for production use
- For AWS deployments:
  - Use AWS Secrets Manager for sensitive credentials
  - Enable AWS WAF for DDoS protection
  - Use VPC with private subnets for RDS
  - Enable RDS encryption at rest
  - Regularly update dependencies and security patches
  - Implement AWS CloudTrail for audit logging

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