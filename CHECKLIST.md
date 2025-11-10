# Getting Started Checklist

Follow this checklist to set up your bubble tea kiosk with database integration.

## ☑️ Prerequisites

- [ ] Node.js installed (v16+) - Check with: `node --version`
- [ ] npm installed - Check with: `npm --version`
- [ ] PostgreSQL client installed - Check with: `psql --version`
- [ ] Connected to TAMU network or VPN
- [ ] Git repository cloned/downloaded

## ☑️ Initial Setup (Do Once)

### Step 1: Install Dependencies
```bash
npm install
```
- [ ] Command completed successfully
- [ ] No error messages

### Step 2: Install Backend Dependencies
```bash
npm install express pg cors dotenv
npm install --save-dev @types/express @types/cors @types/pg ts-node nodemon
```
- [ ] All packages installed
- [ ] No dependency conflicts

### Step 3: Verify Environment Files
- [ ] `.env` file exists in project root
- [ ] `.env` contains database credentials:
  ```
  DB_HOST=csce-315-db.engr.tamu.edu
  DB_USER=gang_12
  DB_PASSWORD=gYd28XpT
  DB_NAME=gang_12_db
  ```
- [ ] `.env.local` file exists
- [ ] `.env.local` contains: `VITE_API_URL=http://localhost:3001/api`

### Step 4: Test Database Connection
```bash
psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db
```
- [ ] Connection successful (prompted for password)
- [ ] Entered password: `gYd28XpT`
- [ ] Can see `gang_12_db=>` prompt
- [ ] Type `\q` to exit

### Step 5: Set Up Database Tables
```bash
npm run db:setup
```
- [ ] Command runs successfully
- [ ] Tables created (menu_items, toppings, orders, order_items)
- [ ] Sample data inserted
- [ ] No error messages

### Step 6: Verify Database Setup
```bash
psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db -c "SELECT COUNT(*) FROM menu_items;"
```
- [ ] Returns count of 16 menu items
- [ ] No errors

## ☑️ Running the Application

### Terminal 1: Backend Server
```bash
npm run server
```
- [ ] Server starts on port 3001
- [ ] Message: "Connected to PostgreSQL database"
- [ ] Message: "Server is running on http://localhost:3001"
- [ ] No error messages
- [ ] Leave this terminal running

### Terminal 2: Frontend Server
```bash
npm run dev
```
- [ ] Server starts (usually port 5173)
- [ ] Message shows local URL
- [ ] No error messages
- [ ] Leave this terminal running

### Browser: Open the App
- [ ] Open browser to `http://localhost:5173`
- [ ] Welcome screen loads
- [ ] No console errors (F12 → Console)

## ☑️ Testing the Integration

### Test 1: Health Check
```bash
curl http://localhost:3001/api/health
```
- [ ] Returns JSON with "status": "healthy"
- [ ] Returns "database": "connected"
- [ ] Shows current timestamp

Or visit in browser: http://localhost:3001/api/health
- [ ] See health check response

### Test 2: Menu Items
Visit: http://localhost:3001/api/menu
- [ ] Returns array of menu items
- [ ] Contains 16 tea items
- [ ] Each has id, name, basePrice, etc.

### Test 3: Complete an Order
1. **Add Item to Cart**
   - [ ] Click "Start Order" on welcome screen
   - [ ] Click on a drink (e.g., "Original Milk Tea")
   - [ ] Customization dialog appears
   - [ ] Select size, sugar level, toppings
   - [ ] Click "Add to Cart"
   - [ ] Item appears in cart badge

2. **View Cart**
   - [ ] Click cart icon
   - [ ] See checkout screen
   - [ ] Items listed correctly
   - [ ] Prices calculated correctly
   - [ ] Can adjust quantity

3. **Complete Order**
   - [ ] Click "Complete Order"
   - [ ] Success dialog appears
   - [ ] No errors in browser console
   - [ ] No errors in backend terminal

4. **Verify in Database**
   ```bash
   psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db -c "SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;"
   ```
   - [ ] Order appears in database
   - [ ] Total price matches
   - [ ] Status is 'pending'
   
   ```bash
   psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db -c "SELECT * FROM order_items ORDER BY created_at DESC LIMIT 3;"
   ```
   - [ ] Order items appear
   - [ ] Quantities correct
   - [ ] Customizations saved

## ☑️ Verify All Features

### Menu Display
- [ ] All drinks show images
- [ ] Prices display correctly
- [ ] Can filter by category
- [ ] Clicking drink opens customization

### Customization
- [ ] Can select size (small/medium/large)
- [ ] Can select sugar level
- [ ] Can add/remove toppings
- [ ] Price updates dynamically

### Cart
- [ ] Items accumulate in cart
- [ ] Can adjust quantities
- [ ] Can remove items
- [ ] Subtotal calculates correctly
- [ ] Tax calculates correctly (8%)
- [ ] Total calculates correctly

### Order Completion
- [ ] Order saves to database
- [ ] Confirmation dialog shows
- [ ] Cart clears after order
- [ ] Returns to welcome screen

## ☑️ Troubleshooting

If any step fails, check:

### Database Connection Issues
- [ ] On TAMU network/VPN?
- [ ] Credentials correct in `.env`?
- [ ] Can ping: `ping csce-315-db.engr.tamu.edu`

### Backend Server Issues
- [ ] Port 3001 available?
- [ ] All dependencies installed?
- [ ] `.env` file in project root?
- [ ] Check terminal for error messages

### Frontend Issues
- [ ] Backend server running?
- [ ] `.env.local` file exists?
- [ ] Check browser console for errors
- [ ] Clear browser cache and reload

### API Connection Issues
- [ ] Both servers running?
- [ ] Correct ports (3001 backend, 5173 frontend)?
- [ ] CORS enabled in backend?
- [ ] Check Network tab in browser DevTools

## ☑️ Additional Verification

### Run Test Script
```bash
./test-setup.sh
```
- [ ] All checks pass
- [ ] Green checkmarks for all items

### View Documentation
- [ ] Read [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- [ ] Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- [ ] Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Read [server/README.md](./server/README.md)

## ☑️ Ready for Development!

Once all items are checked:
- [ ] Application fully functional
- [ ] Database integration working
- [ ] Orders saving successfully
- [ ] Ready to add new features!

## 📝 Notes

Date completed: _______________

Issues encountered:
- 
- 

Solutions:
- 
- 

---

**Need Help?** Refer to:
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed setup guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick commands
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

**Still stuck?** Check:
1. Terminal error messages
2. Browser console (F12)
3. Database connection with manual `psql` command
4. Environment variables in `.env` and `.env.local`
