# Backend Setup Guide

## Overview
This backend connects your React bubble tea kiosk app to a PostgreSQL database hosted on AWS.

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL client installed
- Access to the AWS database (credentials provided)

## Installation Steps

### 1. Install Dependencies
```bash
npm install express pg cors dotenv
npm install --save-dev @types/express @types/cors @types/pg ts-node nodemon
```

### 2. Configure Environment Variables
The `.env` file has been created with your database credentials:
```
DB_HOST=csce-315-db.engr.tamu.edu
DB_USER=gang_12
DB_PASSWORD=gYd28XpT
DB_NAME=gang_12_db
DB_PORT=5432
PORT=3001
```

⚠️ **Important**: Never commit the `.env` file to version control!

### 3. Set Up Database Schema
Run this command to create the necessary tables in your database:
```bash
npm run db:setup
```

When prompted, enter the password: `gYd28XpT`

This will create the following tables:
- `menu_items` - Stores bubble tea menu items
- `toppings` - Stores available toppings
- `orders` - Stores customer orders
- `order_items` - Stores individual items in each order

### 4. Test Database Connection
You can manually connect to verify:
```bash
psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db
```

## Running the Application

### Start the Backend Server
```bash
# Production mode
npm run server

# Development mode with auto-reload
npm run server:dev
```

The server will start on `http://localhost:3001`

### Start the Frontend
In a separate terminal:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or the next available port)

## API Endpoints

### Health Check
- `GET /api/health` - Check server and database connection status

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get a specific menu item
- `GET /api/menu/toppings/all` - Get all available toppings
- `POST /api/menu` - Add a new menu item (admin)
- `PUT /api/menu/:id` - Update a menu item (admin)
- `DELETE /api/menu/:id` - Delete a menu item (admin)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete an order (admin)

## Database Schema

### menu_items
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `description` (TEXT)
- `base_price` (DECIMAL)
- `image_url` (TEXT)
- `category` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

### toppings
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `price` (DECIMAL)
- `created_at` (TIMESTAMP)

### orders
- `id` (SERIAL PRIMARY KEY)
- `total_price` (DECIMAL)
- `status` (VARCHAR) - 'pending', 'preparing', 'ready', 'completed', 'cancelled'
- `created_at`, `updated_at` (TIMESTAMP)

### order_items
- `id` (SERIAL PRIMARY KEY)
- `order_id` (INTEGER, FK to orders)
- `menu_item_id` (INTEGER, FK to menu_items)
- `quantity` (INTEGER)
- `size` (VARCHAR) - 'small', 'medium', 'large'
- `sugar_level` (VARCHAR) - '0%', '25%', '50%', '75%', '100%'
- `toppings` (JSONB) - Array of topping IDs
- `price` (DECIMAL)
- `created_at` (TIMESTAMP)

## Integrating with Frontend

The frontend can now use the API service located at `src/services/api.ts`:

```typescript
import { ordersApi, menuApi } from './services/api';

// Example: Create an order
const order = await ordersApi.create({
  items: [
    {
      menuItemId: '1',
      quantity: 2,
      size: 'medium',
      sugarLevel: '50%',
      toppings: ['boba', 'pudding'],
      price: 12.50
    }
  ],
  totalPrice: 12.50
});

// Example: Fetch menu items
const menuItems = await menuApi.getAll();
```

## Troubleshooting

### Cannot connect to database
1. Check if you're on the TAMU network or VPN
2. Verify credentials in `.env` file
3. Test connection manually with `psql` command

### Port already in use
If port 3001 is in use, change the `PORT` variable in `.env` file

### Module not found errors
Run `npm install` to ensure all dependencies are installed

## Security Notes
- The `.env` file contains sensitive credentials - never commit it
- Use `.env.example` for sharing configuration structure
- Consider implementing authentication for admin endpoints
- Add rate limiting for production use

## Next Steps
- Add authentication/authorization
- Implement order status updates in real-time (WebSockets)
- Add analytics and reporting endpoints
- Set up database backups
- Configure production deployment
