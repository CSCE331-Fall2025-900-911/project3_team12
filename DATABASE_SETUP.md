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

