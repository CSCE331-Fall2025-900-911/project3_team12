# Inventory Usage Reporting

This feature allows managers to track and report on inventory usage over specified date ranges.

## Features

1. **Date Range Selection**: Choose start and end dates to generate custom reports
2. **Usage Summary**: View total items used, total cost, and total units consumed
3. **Detailed Breakdown**: See item-by-item usage statistics including:
   - Total quantity used
   - Average unit cost
   - Total cost per ingredient
   - Number of times the ingredient was used
4. **Current Inventory Snapshot**: View current stock levels alongside usage data

## Setup

### Database Migration

To enable detailed inventory usage tracking, run the following SQL migration on your database:

```bash
psql -d your_database -f server/add_inventory_usage_table.sql
```

Or manually execute the SQL in `server/add_inventory_usage_table.sql`

This creates:
- `inventory_usage` table to track usage records
- Automatic triggers to update inventory quantities
- A summary view for easy reporting
- Sample data for demonstration (optional)

### Basic vs Detailed Reports

**Without Migration (Basic Report)**:
- Shows total orders and revenue in date range
- Displays current inventory snapshot
- Useful for simple tracking

**With Migration (Detailed Report)**:
- Full usage tracking per ingredient
- Cost analysis
- Usage frequency metrics
- Historical usage data

## Using the Report

1. Navigate to Manager Dashboard
2. Click on the "Reports" tab
3. Select start and end dates
4. Click "Generate Report"
5. View summary statistics and detailed breakdown

## API Endpoints

### Generate Report
```
GET /api/inventory/reports/usage?startDate=2025-01-01&endDate=2025-01-31
```

### Record Usage (Manual)
```
POST /api/inventory/usage
Body: {
  "inventory_id": 1,
  "quantity_used": 5.5,
  "unit_cost": 2.50,
  "order_id": 123,
  "notes": "Used for order #123"
}
```

## Frontend Integration

The report is automatically integrated into the ManagerDashboard component with:
- Date pickers for range selection
- Loading states
- Error handling
- Formatted tables and summary cards
- Color-coded status indicators

## Future Enhancements

- Export reports to CSV/PDF
- Automatic usage recording when orders are placed
- Cost trending over time
- Low stock alerts in reports
- Predictive inventory needs based on usage patterns
