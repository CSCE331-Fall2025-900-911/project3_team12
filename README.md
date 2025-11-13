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

The frontend will be at `http://localhost:5173` and backend at `http://localhost:3001`

### For Frontend Only Development

```bash
npm install
npm run dev
```

## 📚 Documentation

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database integration guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference card for common commands
- **[server/README.md](./server/README.md)** - Backend API documentation

## 🏗️ Project Structure

```
├── src/                      # Frontend React application
│   ├── components/          # React components
│   ├── services/            # API client
│   └── types/               # TypeScript types
├── server/                   # Backend Node.js/Express server
│   ├── index.ts             # Server entry point
│   ├── db.ts                # Database connection
│   ├── routes/              # API routes
│   ├── schema.sql           # Database schema
│   └── queries.sql          # Useful SQL queries
├── .env                     # Database credentials (DO NOT COMMIT!)
└── .env.local               # Frontend environment variables
```

## 🗄️ Database Connection

**Host:** `csce-315-db.engr.tamu.edu`  
**Database:** `gang_12_db`  
**User:** `gang_12`  

Connect via command line:
```bash
psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db
```

## 🔌 API Endpoints

- `GET /api/health` - Check server health
- `GET /api/menu` - Get all menu items
- `GET /api/menu/toppings/all` - Get toppings
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `PATCH /api/orders/:id/status` - Update order status

See [server/README.md](./server/README.md) for complete API documentation.

## 📦 Available Scripts

```bash
npm run dev           # Start frontend dev server
npm run build         # Build frontend for production
npm run server        # Start backend server
npm run server:dev    # Start backend with auto-reload
npm run db:setup      # Initialize database tables
```

## 🧪 Testing the Database Integration

1. Start both frontend and backend servers
2. Add drinks to cart with customizations
3. Complete the order at checkout
4. Verify order in database:
```bash
psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db -c "SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;"
```

## 🚢 Deploy to Vercel (Frontend Only)

1. Connect this Git repository to Vercel (Vercel app → New Project → Import Git Repository)
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Add environment variable: `VITE_API_URL=<your-backend-url>`

**Note:** Backend needs separate deployment (consider Railway, Render, or AWS)

## 🔐 Security Notes

- `.env` file contains sensitive credentials - **NEVER commit it**
- Use `.env.example` to share configuration structure
- The `.gitignore` is configured to exclude `.env` files

## 🛠️ Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components

### Backend
- Node.js
- Express.js
- PostgreSQL (pg driver)
- TypeScript

## ⚠️ Troubleshooting

**Can't connect to database?**
- Ensure you're on TAMU network or connected to TAMU VPN

**Port already in use?**
- Change `PORT` in `.env` file

**Module not found?**
- Run `npm install`

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed troubleshooting.

## 📝 Notes

- Dependencies are pinned for reproducible builds
- TypeScript configured for both frontend and backend
- CORS enabled for local development
- Database uses connection pooling for performance

## 🤝 Contributing

When adding new features:
1. Update database schema in `server/schema.sql` if needed
2. Add new API endpoints in `server/routes/`
3. Update API client in `src/services/api.ts`
4. Update documentation

---

For detailed setup instructions, see **[DATABASE_SETUP.md](./DATABASE_SETUP.md)**
  
