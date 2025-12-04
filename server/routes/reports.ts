import express, { Request, Response } from 'express';
import { query } from '../db';

const router = express.Router();

// Sales summary
router.get('/sales', async (req: Request, res: Response) => {
  try {
    // Accept either `start`/`end` or `startDate`/`endDate` for compatibility
    const q = req.query as Record<string, string | undefined>;
    const start = q.start || q.startDate;
    const end = q.end || q.endDate;

    console.log('/api/reports/sales params:', { start, end });

    let where = '';
    const params: any[] = [];
    if (start && end) {
      params.push(start, end);
      where = 'WHERE created_at >= $1 AND created_at <= $2';
    }

    const result = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_price),0) as total_revenue,
        COALESCE(AVG(total_price),0) as avg_order_value,
        MIN(created_at) as first_order,
        MAX(created_at) as last_order
      FROM orders
      ${where}
    `, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error generating sales summary:', error);
    res.status(500).json({ error: 'Failed to generate sales summary' });
  }
});

// Most popular drinks
router.get('/popular', async (req: Request, res: Response) => {
  try {
    // Accept optional start/end query params; default to today. Also accept startDate/endDate fallback.
    const q = req.query as Record<string, string | undefined>;
    let startTs = q.start || q.startDate;
    let endTs = q.end || q.endDate;
    if (!startTs || !endTs) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
      startTs = startOfDay.toISOString();
      endTs = endOfDay.toISOString();
    }
    console.log('/api/reports/popular params:', { startTs, endTs });

    const result = await query(`
      SELECT 
        mi.id,
        mi.name,
        COUNT(oi.id) as times_ordered,
        SUM(oi.quantity) as total_quantity
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= $1 AND o.created_at <= $2
      GROUP BY mi.id, mi.name
      ORDER BY times_ordered DESC
      LIMIT 20
    `, [startTs, endTs]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generating popular drinks report:', error);
    res.status(500).json({ error: 'Failed to generate popular drinks report' });
  }
});

// Orders by status
router.get('/status', async (req: Request, res: Response) => {
  try {
    // Accept optional start/end query params; default to today. Also accept startDate/endDate fallback.
    const q = req.query as Record<string, string | undefined>;
    let startTs = q.start || q.startDate;
    let endTs = q.end || q.endDate;
    if (!startTs || !endTs) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
      startTs = startOfDay.toISOString();
      endTs = endOfDay.toISOString();
    }

    console.log('/api/reports/status params:', { startTs, endTs });

    const result = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_price),0) as total_value
      FROM orders
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY status
      ORDER BY count DESC
    `, [startTs, endTs]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generating orders-by-status report:', error);
    res.status(500).json({ error: 'Failed to generate orders-by-status report' });
  }
});

export default router;
