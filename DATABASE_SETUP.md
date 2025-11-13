# Database Integration Setup - Complete Guide

## 🎯 Overview
This guide will help you connect your bubble tea kiosk application to a PostgreSQL database hosted on AWS. When customers complete orders, they will be saved to the database automatically.

## 📋 Prerequisites
- Node.js (v16 or higher)
- PostgreSQL client (`psql`) installed
- Terminal access
- TAMU network or VPN connection

## 🚀 Quick Start

### Step 1: Install Required Dependencies
Open your terminal in the project directory and run:

```bash
npm install express pg cors dotenv
npm install --save-dev @types/express @types/cors @types/pg ts-node nodemon
```

### Step 2: Database Connection Test
Test if you can connect to the database:

```bash
psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db
```

When prompted, enter password: `gYd28XpT`

If connected successfully, you should see a PostgreSQL prompt. Type `\q` to exit.

### Step 3: Set Up Database Tables
Run this command to create all necessary tables:

```bash
npm run db:setup
```

Enter password when prompted: `gYd28XpT`

This creates:
- `menu_items` table - stores your bubble tea products
- `toppings` table - stores available toppings
- `orders` table - stores customer orders
- `order_items` table - stores items within each order

### Step 4: Start the Backend Server
Open a terminal and run:

```bash
npm run server
```

You should see:
```
Server is running on http://localhost:3001
Database: gang_12_db@csce-315-db.engr.tamu.edu
Connected to PostgreSQL database
```

### Step 5: Start the Frontend (in a new terminal)
Open a new terminal window and run:

```bash
npm run dev
```

The app will start at `http://localhost:5173`

## 🎉 Testing the Integration

1. **Open the app** in your browser
2. **Add drinks to cart** with customizations
3. **Complete the order** at checkout
4. **Verify in database**:
   ```bash
   psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db
   ```
   Then run:
   ```sql
   SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM order_items ORDER BY created_at DESC LIMIT 10;
   ```

## 📁 Project Structure

```
project3_team12/
├── server/                  # Backend code
│   ├── index.ts            # Express server
│   ├── db.ts               # Database connection
│   ├── schema.sql          # Database schema
│   ├── routes/
│   │   ├── menu.ts         # Menu API endpoints
│   │   └── orders.ts       # Orders API endpoints
│   └── README.md           # Backend documentation
├── src/
│   ├── services/
│   │   └── api.ts          # API client for frontend
│   └── components/
│       └── CheckoutScreen.tsx  # Updated with DB integration
├── .env                    # Database credentials (DO NOT COMMIT!)
├── .env.local              # Frontend environment variables
└── .env.example            # Template for environment variables
```

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Verify server and database connection

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get specific menu item
- `GET /api/menu/toppings/all` - Get all toppings
- `POST /api/menu` - Add new menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order ⭐ (Used by checkout)
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

## 🗃️ Database Schema

### orders table
```sql
- id: Serial primary key
- total_price: Decimal(10,2)
- status: VARCHAR (pending/preparing/ready/completed/cancelled)
- created_at: Timestamp
- updated_at: Timestamp
```

### order_items table
```sql
- id: Serial primary key
- order_id: Integer (references orders)
- menu_item_id: Integer (references menu_items)
- quantity: Integer
- size: VARCHAR (small/medium/large)
- sugar_level: VARCHAR (no-sugar/half-sugar/normal)
- toppings: JSONB (array of topping IDs)
- price: Decimal(10,2)
- created_at: Timestamp
```

## 🔧 Troubleshooting

### Problem: Cannot connect to database
**Solutions:**
- Ensure you're on TAMU network or connected to TAMU VPN
- Verify credentials in `.env` file are correct
- Check if PostgreSQL is accessible: `ping csce-315-db.engr.tamu.edu`

### Problem: Port 3001 already in use
**Solution:**
Edit `.env` file and change `PORT=3001` to another port like `PORT=3002`

### Problem: Module not found errors
**Solution:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: Orders not saving to database
**Solutions:**
1. Check if backend server is running (`npm run server`)
2. Check browser console for errors (F12 → Console tab)
3. Verify API URL in `.env.local` matches your backend port
4. Test health endpoint: `http://localhost:3001/api/health`

### Problem: CORS errors in browser
**Solution:**
The backend already has CORS enabled. Ensure both frontend and backend are running and using correct ports.

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- **NEVER** commit `.env` file to Git
- The `.env` file contains your database password
- `.gitignore` is configured to exclude `.env`
- Use `.env.example` to share configuration structure (without credentials)

## 📝 Development Workflow

### Daily Development:
1. Start backend: `npm run server:dev` (auto-reloads on changes)
2. Start frontend: `npm run dev` (in separate terminal)
3. Make changes
4. Test in browser

### Production Build:
```bash
npm run build
```

## 🎓 How It Works

1. **User completes order** in `CheckoutScreen.tsx`
2. **Frontend calls API** via `ordersApi.create()` in `src/services/api.ts`
3. **Backend receives request** at `/api/orders` endpoint
4. **Database transaction** begins
   - Insert into `orders` table
   - Insert items into `order_items` table
   - Commit transaction
5. **Response sent back** to frontend with order details
6. **Success message** displayed to user

## 📊 Useful SQL Queries

### View recent orders:
```sql
SELECT o.id, o.total_price, o.status, o.created_at, 
       COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### View orders with items:
```sql
SELECT o.id as order_id, o.total_price, o.status,
       mi.name as item_name, oi.quantity, oi.size, oi.sugar_level
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN menu_items mi ON oi.menu_item_id = mi.id
ORDER BY o.created_at DESC;
```

### Total sales:
```sql
SELECT SUM(total_price) as total_sales, COUNT(*) as order_count
FROM orders
WHERE status = 'completed';
```

## 🆘 Need Help?

1. Check `server/README.md` for detailed backend documentation
2. Review error messages in terminal and browser console
3. Test database connection manually with `psql` command
4. Verify all environment variables are set correctly

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] Database tables created (`npm run db:setup`)
- [ ] Backend server running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can complete order in browser
- [ ] Order appears in database (verify with SQL query)
- [ ] No console errors in browser or terminal

---

**Congratulations!** 🎊 Your bubble tea kiosk is now connected to the PostgreSQL database on AWS!
