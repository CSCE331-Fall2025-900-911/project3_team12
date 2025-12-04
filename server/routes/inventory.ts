import express, { Request, Response } from 'express';
import { query } from '../db';

const router = express.Router();

// Get all inventory items
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, ingredient_name, quantity, unit, min_quantity, created_at, updated_at FROM inventory ORDER BY ingredient_name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ 
      error: 'Failed to fetch inventory',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single inventory item
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, ingredient_name, quantity, unit, min_quantity, created_at, updated_at FROM inventory WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ 
      error: 'Failed to fetch inventory item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add new inventory item
router.post('/', async (req: Request, res: Response) => {
  try {
    const { ingredient_name, quantity, unit, min_quantity } = req.body;

    if (!ingredient_name) {
      return res.status(400).json({ error: 'Ingredient name is required' });
    }

    // Check if ingredient already exists
    const existing = await query(
      'SELECT id FROM inventory WHERE ingredient_name = $1',
      [ingredient_name]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ingredient already exists' });
    }

    const result = await query(
      'INSERT INTO inventory (ingredient_name, quantity, unit, min_quantity) VALUES ($1, $2, $3, $4) RETURNING id, ingredient_name, quantity, unit, min_quantity, created_at, updated_at',
      [ingredient_name, quantity || 0, unit || 'units', min_quantity || 10]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ 
      error: 'Failed to add inventory item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update inventory item
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ingredient_name, quantity, unit, min_quantity } = req.body;

    const result = await query(
      'UPDATE inventory SET ingredient_name = COALESCE($1, ingredient_name), quantity = COALESCE($2, quantity), unit = COALESCE($3, unit), min_quantity = COALESCE($4, min_quantity) WHERE id = $5 RETURNING id, ingredient_name, quantity, unit, min_quantity, created_at, updated_at',
      [ingredient_name, quantity, unit, min_quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ 
      error: 'Failed to update inventory item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete inventory item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM inventory WHERE id = $1 RETURNING ingredient_name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ 
      message: 'Inventory item deleted successfully',
      ingredient_name: result.rows[0].ingredient_name
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ 
      error: 'Failed to delete inventory item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get low stock items
router.get('/alerts/low-stock', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, ingredient_name, quantity, unit, min_quantity FROM inventory WHERE quantity <= min_quantity ORDER BY (quantity - min_quantity) ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch low stock items',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Record inventory usage
router.post('/usage', async (req: Request, res: Response) => {
  try {
    const { inventory_id, quantity_used, unit_cost, order_id, notes, created_by } = req.body;

    if (!inventory_id || !quantity_used) {
      return res.status(400).json({ 
        error: 'Inventory ID and quantity used are required',
        message: 'Please provide both inventory_id and quantity_used'
      });
    }

    // Check if inventory_usage table exists
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'inventory_usage'
      )`
    );

    if (!tableCheck.rows[0].exists) {
      return res.status(501).json({ 
        error: 'Inventory usage tracking not enabled',
        message: 'Please run the add_inventory_usage_table.sql migration first'
      });
    }

    const result = await query(
      `INSERT INTO inventory_usage (inventory_id, quantity_used, unit_cost, order_id, notes, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, inventory_id, quantity_used, unit_cost, order_id, used_at, notes, created_by`,
      [inventory_id, quantity_used, unit_cost || 0, order_id || null, notes || null, created_by || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error recording inventory usage:', error);
    res.status(500).json({ 
      error: 'Failed to record inventory usage',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get inventory usage report
router.get('/reports/usage', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Start date and end date are required',
        message: 'Please provide both startDate and endDate query parameters'
      });
    }

    // Get inventory changes between dates
    // This assumes we track inventory changes in a separate table
    // For now, we'll create a mock report based on orders placed during this period
    
    // First, check if inventory_usage table exists, if not return a basic report
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'inventory_usage'
      )`
    );

    if (!tableCheck.rows[0].exists) {
      // Return a basic report based on orders in the date range
      const ordersResult = await query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(total_price) as total_revenue
        FROM orders 
        WHERE created_at >= $1 AND created_at <= $2`,
        [startDate, endDate]
      );

      const inventorySnapshot = await query(
        'SELECT id, ingredient_name, quantity, unit, min_quantity FROM inventory ORDER BY ingredient_name ASC'
      );

      return res.json({
        reportType: 'basic',
        dateRange: { startDate, endDate },
        summary: {
          totalOrders: parseInt(ordersResult.rows[0].total_orders) || 0,
          totalRevenue: parseFloat(ordersResult.rows[0].total_revenue) || 0,
          message: 'Detailed inventory usage tracking not yet implemented'
        },
        currentInventory: inventorySnapshot.rows
      });
    }

    // If inventory_usage table exists, generate detailed report
    const usageResult = await query(
      `SELECT 
        i.ingredient_name,
        i.unit,
        COALESCE(SUM(iu.quantity_used), 0) as total_used,
        COALESCE(AVG(iu.unit_cost), 0) as avg_unit_cost,
        COALESCE(SUM(iu.quantity_used * iu.unit_cost), 0) as total_cost,
        COUNT(iu.id) as usage_count
      FROM inventory i
      LEFT JOIN inventory_usage iu ON i.id = iu.inventory_id 
        AND iu.used_at >= $1 
        AND iu.used_at <= $2
      GROUP BY i.id, i.ingredient_name, i.unit
      ORDER BY total_cost DESC`,
      [startDate, endDate]
    );

    const summaryResult = await query(
      `SELECT 
        COUNT(DISTINCT iu.inventory_id) as items_used,
        SUM(iu.quantity_used * iu.unit_cost) as total_cost,
        SUM(iu.quantity_used) as total_units_used
      FROM inventory_usage iu
      WHERE iu.used_at >= $1 AND iu.used_at <= $2`,
      [startDate, endDate]
    );

    res.json({
      reportType: 'detailed',
      dateRange: { startDate, endDate },
      summary: {
        itemsUsed: parseInt(summaryResult.rows[0].items_used) || 0,
        totalCost: parseFloat(summaryResult.rows[0].total_cost) || 0,
        totalUnitsUsed: parseFloat(summaryResult.rows[0].total_units_used) || 0
      },
      items: usageResult.rows.map(row => ({
        ingredientName: row.ingredient_name,
        unit: row.unit,
        totalUsed: parseFloat(row.total_used),
        avgUnitCost: parseFloat(row.avg_unit_cost),
        totalCost: parseFloat(row.total_cost),
        usageCount: parseInt(row.usage_count)
      }))
    });
  } catch (error) {
    console.error('Error generating inventory usage report:', error);
    res.status(500).json({ 
      error: 'Failed to generate inventory usage report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
