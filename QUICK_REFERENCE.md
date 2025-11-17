# 🚀 Quick Reference Card

## Database Credentials
```
Host: csce-315-db.engr.tamu.edu
User: gang_12
Password: gYd28XpT
Database: gang_12_db
Port: 5432
```

## Essential Commands

### Setup (Run Once)
```bash
# 1. Install dependencies
npm install express pg cors dotenv
npm install --save-dev @types/express @types/cors @types/pg ts-node nodemon

# 2. Create database tables
npm run db:setup
# Enter password: gYd28XpT
```

### Daily Development
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

### Database Access
```bash
# Connect to database
psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db
# Password: gYd28XpT

# Useful queries once connected:
\dt                          # List all tables
SELECT * FROM orders;        # View all orders
SELECT * FROM order_items;   # View order items
\q                           # Quit
```

## Application URLs
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **API Health:** http://localhost:3001/api/health

## File Locations
- **Backend Server:** `server/index.ts`
- **Database Config:** `server/db.ts`
- **API Routes:** `server/routes/`
- **Frontend API Client:** `src/services/api.ts`
- **Checkout (with DB integration):** `src/components/CheckoutScreen.tsx`
- **Environment Variables:** `.env` (never commit!)

## Testing Order Creation
1. Open app: http://localhost:5173
2. Add drinks to cart
3. Go to checkout
4. Complete order
5. Check terminal for "Executed query" log
6. Verify in database:
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect to DB | Check TAMU VPN/network |
| Port already in use | Change PORT in `.env` |
| Module not found | Run `npm install` |
| CORS errors | Ensure both servers running |

## NPM Scripts
```bash
npm run dev          # Start frontend dev server
npm run build        # Build frontend for production
npm run server       # Start backend server
npm run server:dev   # Start backend with auto-reload
npm run db:setup     # Initialize database tables
```

## API Endpoints Summary
```
GET    /api/health                    # Health check
GET    /api/menu                      # Get all menu items
GET    /api/menu/toppings/all         # Get toppings
POST   /api/orders                    # Create order ⭐
GET    /api/orders                    # Get all orders
GET    /api/orders/:id                # Get specific ordergit
PATCH  /api/orders/:id/status         # Update order status
```

## Database Tables
- `menu_items` - Tea products
- `toppings` - Available toppings
- `orders` - Customer orders
- `order_items` - Items in each order

---
📖 **Full Guide:** See `DATABASE_SETUP.md`
🔧 **Backend Docs:** See `server/README.md`
