#!/bin/bash

echo "🧪 Testing Database Connection Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
echo "1. Checking .env file..."
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
else
    echo -e "${RED}✗ .env file not found${NC}"
    echo "Please ensure .env file is created with database credentials"
    exit 1
fi

# Check if node_modules exists
echo ""
echo "2. Checking dependencies..."
if [ -d node_modules ]; then
    echo -e "${GREEN}✓ node_modules exists${NC}"
    
    # Check for required packages
    if [ -d node_modules/express ] && [ -d node_modules/pg ] && [ -d node_modules/cors ]; then
        echo -e "${GREEN}✓ Required packages installed${NC}"
    else
        echo -e "${YELLOW}⚠ Some packages might be missing. Run: npm install${NC}"
    fi
else
    echo -e "${RED}✗ node_modules not found${NC}"
    echo "Please run: npm install"
    exit 1
fi

# Check if server directory exists
echo ""
echo "3. Checking server files..."
if [ -d server ]; then
    echo -e "${GREEN}✓ server directory exists${NC}"
    
    if [ -f server/index.ts ] && [ -f server/db.ts ]; then
        echo -e "${GREEN}✓ Server files present${NC}"
    else
        echo -e "${RED}✗ Server files missing${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ server directory not found${NC}"
    exit 1
fi

# Check if API service exists
echo ""
echo "4. Checking frontend integration..."
if [ -f src/services/api.ts ]; then
    echo -e "${GREEN}✓ API service file exists${NC}"
else
    echo -e "${YELLOW}⚠ API service file not found${NC}"
fi

# Test database connection
echo ""
echo "5. Testing database connection..."
echo "Attempting to connect to database..."

# Try to connect (non-interactive check)
PGPASSWORD=gYd28XpT psql -h csce-315-db.engr.tamu.edu -U gang_12 -d gang_12_db -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful!${NC}"
else
    echo -e "${RED}✗ Cannot connect to database${NC}"
    echo "Please ensure you are connected to TAMU network/VPN"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Set up database tables (if not done):"
echo "   ${YELLOW}npm run db:setup${NC}"
echo ""
echo "2. Start the backend server:"
echo "   ${YELLOW}npm run server${NC}"
echo ""
echo "3. In a new terminal, start frontend:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "4. Test the integration by completing an order!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
