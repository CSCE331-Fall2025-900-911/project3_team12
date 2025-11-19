import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../_db';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    try {
      const r = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100');
      return res.status(200).json(r.rows);
    } catch (err: any) {
      console.error('orders list error', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: 'Invalid payload: items required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const totalCents = Math.round((body.total || body.totalPrice || 0) * 100);
      const orderRes = await client.query(
        'INSERT INTO orders (total_cents, status, customer_metadata) VALUES ($1,$2,$3) RETURNING id, created_at',
        [totalCents, 'pending', body.metadata || {}]
      );
      const orderId = orderRes.rows[0].id;

      const insertItem = 'INSERT INTO order_items (order_id, product_id, unit_price_cents, quantity, options) VALUES ($1,$2,$3,$4,$5)';
      for (const it of body.items) {
        await client.query(insertItem, [
          orderId,
          it.productId || it.menuItemId,
          Math.round((it.unitPrice || it.price || 0) * 100),
          it.quantity || 1,
          it.options || { size: it.size, sugarLevel: it.sugarLevel, toppings: it.toppings },
        ]);
      }

      await client.query('COMMIT');
      return res.status(201).json({ orderId, status: 'pending', createdAt: orderRes.rows[0].created_at });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('create order error', err);
      return res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
