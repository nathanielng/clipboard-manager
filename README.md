# 📋 Clipboard Manager

A full-stack clipboard manager application that tracks everything you copy and paste with timestamps. Works seamlessly on both mobile phones and desktop browsers with a PostgreSQL backend for persistent storage.

## ✨ Features

- 📝 **Copy/Paste Tracking** - Save any text content with a single click
- ⏰ **Automatic Timestamps** - Every entry is timestamped when created
- 📱 **Cross-Platform** - Works on mobile and desktop browsers (Progressive Web App)
- 💾 **Persistent Storage** - All clipboard history saved in PostgreSQL database
- 🔍 **Search Functionality** - Quickly find content in your clipboard history
- 🎨 **Modern UI** - Clean, responsive design that works everywhere
- 📊 **Device Tracking** - See which device each entry came from
- 🗑️ **Easy Management** - Delete individual entries or clear entire history

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **PostgreSQL** - Database for clipboard history
- **Prisma ORM** - Type-safe database access
- **TypeScript** - Type safety and better DX

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

The included `docker-compose.yml` provides an easy PostgreSQL setup:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## 🔒 Security Notes

- Currently single-user (no authentication)
- Clipboard API requires HTTPS in production (except localhost)
- Add authentication before deploying to production
- Consider rate limiting for production use

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