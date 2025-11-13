import express, { Request, Response } from 'express';
import { query } from '../db.js';

const router = express.Router();

// Helper to parse date query params; defaults to last 30 days
function parseDateRange(req: Request) {
  const { start, end, days } = req.query as { start?: string; end?: string; days?: string };
  let endDate = end ? new Date(end) : new Date();
  let startDate: Date;

  if (start) {
    startDate = new Date(start);
  } else if (days) {
    const d = parseInt(days, 10) || 30;
    startDate = new Date();
    startDate.setDate(endDate.getDate() - d);
  } else {
    // default last 30 days
    startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
  }

  // Normalize time part to cover whole days
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { start: startDate.toISOString(), end: endDate.toISOString() };
}

// GET /api/reports/sales?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/sales', async (req: Request, res: Response) => {
  try {
    const { start, end } = parseDateRange(req);

    const summaryResult = await query(
      `SELECT COUNT(*)::int as "totalOrders", COALESCE(SUM(total_price),0)::numeric as "totalRevenue"
       FROM orders
       WHERE created_at >= $1 AND created_at <= $2`,
      [start, end]
    );

    const itemsResult = await query(
      `SELECT oi.menu_item_id as "menuItemId",
              oi.item_name as "itemName",
              SUM(oi.quantity)::int as "quantitySold",
              SUM(oi.price * oi.quantity)::numeric as "revenue"
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.created_at >= $1 AND o.created_at <= $2
       GROUP BY oi.menu_item_id, oi.item_name
       ORDER BY "quantitySold" DESC
       LIMIT 50`,
      [start, end]
    );

    res.json({
      range: { start, end },
      summary: summaryResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// GET /api/reports/daily?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/daily', async (req: Request, res: Response) => {
  try {
    const { start, end } = parseDateRange(req);

    const dailyResult = await query(
      `SELECT date_trunc('day', o.created_at)::date as day,
              COUNT(DISTINCT o.id)::int as orders,
              COALESCE(SUM(o.total_price),0)::numeric as revenue
       FROM orders o
       WHERE o.created_at >= $1 AND o.created_at <= $2
       GROUP BY day
       ORDER BY day`,
      [start, end]
    );

    res.json({ range: { start, end }, daily: dailyResult.rows });
  } catch (error) {
    console.error('Error generating daily sales report:', error);
    res.status(500).json({ error: 'Failed to generate daily sales report' });
  }
});

// GET /api/reports/top-items?start=...&end=...
router.get('/top-items', async (req: Request, res: Response) => {
  try {
    const { start, end } = parseDateRange(req);

    const topResult = await query(
      `SELECT oi.menu_item_id as "menuItemId",
              oi.item_name as "itemName",
              SUM(oi.quantity)::int as "quantitySold",
              SUM(oi.price * oi.quantity)::numeric as "revenue"
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.created_at >= $1 AND o.created_at <= $2
       GROUP BY oi.menu_item_id, oi.item_name
       ORDER BY "revenue" DESC
       LIMIT 10`,
      [start, end]
    );

    res.json({ range: { start, end }, top: topResult.rows });
  } catch (error) {
    console.error('Error fetching top items:', error);
    res.status(500).json({ error: 'Failed to fetch top items' });
  }
});

export default router;
