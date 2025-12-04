import express, { Request, Response } from 'express';
import { query } from '../db';

const router = express.Router();

// Sales summary
router.get('/sales', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_price),0) as total_revenue,
        COALESCE(AVG(total_price),0) as avg_order_value,
        MIN(created_at) as first_order,
        MAX(created_at) as last_order
      FROM orders
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error generating sales summary:', error);
    res.status(500).json({ error: 'Failed to generate sales summary' });
  }
});

// Most popular drinks
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        mi.id,
        mi.name,
        COUNT(oi.id) as times_ordered,
        SUM(oi.quantity) as total_quantity
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      GROUP BY mi.id, mi.name
      ORDER BY times_ordered DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generating popular drinks report:', error);
    res.status(500).json({ error: 'Failed to generate popular drinks report' });
  }
});

// Orders by status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_price),0) as total_value
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generating orders-by-status report:', error);
    res.status(500).json({ error: 'Failed to generate orders-by-status report' });
  }
});

export default router;
