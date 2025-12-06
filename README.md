# Kiosk App — Bubble Tea Ordering System with Database Integration

This repository contains a full-stack bubble tea kiosk application with a React/Vite frontend and Node.js/Express backend connected to a PostgreSQL database hosted on AWS.

## 🚀 Quick Start

### For Full Application (Frontend + Backend + Database)

1. **Install dependencies:**

```bash
npm install
```

2. **Set up database (first time only):**

```bash
npm run db:setup
```
When prompted, enter password:

3. **Start backend server (Terminal 1):**

```bash
npm run server
```

4. **Start frontend dev server (Terminal 2):**

```bash
npm run dev
```

### For Frontend Only Development

```bash
npm install
npm run dev
```

## 🗄️ Database Connection

**Host:** `csce-315-db.engr.tamu.edu`  
**Database:** `gang_12_db`  
**User:** `gang_12`  

Connect via command line:
```bash
psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db
```

## 📦 Available Scripts

```bash
npm run dev           # Start frontend dev server
npm run build         # Build frontend for production
npm run server        # Start backend server
npm run server:dev    # Start backend with auto-reload
npm run db:setup      # Initialize database tables and data
```

## 🛠️ Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js
- PostgreSQL
- TypeScript

  
