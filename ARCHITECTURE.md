# System Architecture

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                       │
│                    (React + TypeScript)                      │
│                   http://localhost:5173                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests (REST API)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      API CLIENT                              │
│                  (src/services/api.ts)                       │
│  • menuApi.getAll()                                         │
│  • ordersApi.create()                                       │
│  • healthApi.check()                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Fetch API calls
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   EXPRESS SERVER                             │
│                (server/index.ts)                             │
│              http://localhost:3001                           │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │         API Routes                             │          │
│  │  • GET  /api/health                           │          │
│  │  • GET  /api/menu                             │          │
│  │  • POST /api/orders     ⭐                    │          │
│  │  • GET  /api/orders                           │          │
│  └──────────────────────────────────────────────┘          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ SQL Queries (pg driver)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              POSTGRESQL DATABASE                             │
│         csce-315-db.engr.tamu.edu                           │
│              gang_12_db                                      │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Tables:                                      │          │
│  │  • menu_items      (bubble tea products)     │          │
│  │  • toppings        (available add-ons)       │          │
│  │  • orders          (customer orders)         │          │
│  │  • order_items     (items in each order)     │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Credentials:                                               │
│  • User: gang_12                                            │
│  • Password: gYd28XpT                                       │
│  • Port: 5432                                               │
└──────────────────────────────────────────────────────────────┘
```

## Order Creation Flow

```
  1. User adds drinks to cart
          │
          ▼
  2. User clicks "Complete Order"
          │
          ▼
  3. CheckoutScreen.tsx calls:
     ordersApi.create({ items, totalPrice })
          │
          ▼
  4. API request sent to:
     POST http://localhost:3001/api/orders
          │
          ▼
  5. Express server (server/routes/orders.ts)
     - Validates request
     - Starts database transaction
          │
          ▼
  6. Insert into database:
     - INSERT INTO orders (total_price, status)
     - INSERT INTO order_items (order_id, menu_item_id, ...)
     - COMMIT transaction
          │
          ▼
  7. Database returns order ID
          │
          ▼
  8. Server sends response to frontend
          │
          ▼
  9. Success dialog shown to user
          │
          ▼
  10. Cart cleared, return to welcome screen
```

## Database Relationships

```
┌─────────────────┐
│   menu_items    │
│─────────────────│       ┌──────────────────┐
│ id (PK)        │◄──────┤  order_items     │
│ name           │       │──────────────────│
│ base_price     │       │ id (PK)          │
│ category       │       │ order_id (FK)    │
└─────────────────┘       │ menu_item_id (FK)│
                          │ quantity         │
                          │ size             │
┌─────────────────┐       │ sugar_level      │
│   toppings      │       │ toppings (JSONB) │
│─────────────────│       │ price            │
│ id (PK)        │       └────────┬──────────┘
│ name           │                │
│ price          │                │
└─────────────────┘                │
                                   │
                          ┌────────▼──────────┐
                          │     orders        │
                          │───────────────────│
                          │ id (PK)           │
                          │ total_price       │
                          │ status            │
                          │ created_at        │
                          └───────────────────┘
```

## File Structure

```
project3_team12/
│
├── Frontend (React/TypeScript)
│   ├── src/
│   │   ├── App.tsx                    # Main app component
│   │   ├── components/
│   │   │   ├── WelcomeScreen.tsx      # Landing page
│   │   │   ├── MenuScreen.tsx         # Menu display
│   │   │   └── CheckoutScreen.tsx     # Cart & Order ⭐
│   │   ├── services/
│   │   │   └── api.ts                 # API client ⭐
│   │   └── types/
│   │       └── types.ts               # TypeScript types
│   └── .env.local                     # Frontend env vars
│
├── Backend (Node.js/Express)
│   ├── server/
│   │   ├── index.ts                   # Express server ⭐
│   │   ├── db.ts                      # DB connection ⭐
│   │   ├── routes/
│   │   │   ├── menu.ts                # Menu endpoints
│   │   │   └── orders.ts              # Order endpoints ⭐
│   │   ├── schema.sql                 # DB schema
│   │   └── queries.sql                # Useful queries
│   └── .env                           # Backend env vars
│
└── Documentation
    ├── README.md                      # Main documentation
    ├── DATABASE_SETUP.md              # Setup guide
    ├── QUICK_REFERENCE.md             # Quick commands
    └── ARCHITECTURE.md                # This file
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **pg** - PostgreSQL client
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

### Database
- **PostgreSQL 15+** - Relational database
- **AWS RDS** - Hosted database
- **Connection Pooling** - Performance optimization

## Security Features

1. **Environment Variables**
   - Database credentials in `.env` (not committed)
   - Separate env files for frontend/backend

2. **CORS Configuration**
   - Enabled for local development
   - Can be restricted for production

3. **Database Connection**
   - Connection pooling
   - SSL enabled
   - Error handling

4. **Input Validation**
   - Type checking via TypeScript
   - Server-side validation

## Performance Optimizations

1. **Database**
   - Connection pooling (reuses connections)
   - Indexes on frequently queried columns
   - Transactions for data consistency

2. **API**
   - RESTful design
   - JSON responses
   - Error handling

3. **Frontend**
   - Component-based architecture
   - State management in React
   - Lazy loading potential

## Future Enhancements

### Authentication
```
User Login → JWT Token → Protected Routes → Order History
```

### Real-time Updates
```
WebSocket Connection → Order Status Changes → Live Updates
```

### Analytics Dashboard
```
Database Queries → Chart Data → Admin Dashboard
```

### Mobile App
```
React Native → Same API → Cross-platform
```

## Development Workflow

```
1. Code Changes
   ├── Frontend: src/ files → Auto reload (Vite)
   └── Backend: server/ files → Manual restart (or use server:dev)
        
2. Testing
   ├── Frontend: Browser + DevTools
   ├── Backend: Terminal logs
   └── Database: psql + SQL queries
        
3. Commit
   ├── Git add/commit (excludes .env)
   └── Push to repository
```

## Deployment Strategy

### Development
- Frontend: `npm run dev` (localhost:5173)
- Backend: `npm run server` (localhost:3001)
- Database: AWS RDS (remote)

### Production
- Frontend: Vercel / Netlify (static hosting)
- Backend: Railway / Render / AWS EC2
- Database: AWS RDS (same as dev)

---

For implementation details, see the comprehensive guides:
- **Setup:** [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Quick Ref:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **API Docs:** [server/README.md](./server/README.md)
