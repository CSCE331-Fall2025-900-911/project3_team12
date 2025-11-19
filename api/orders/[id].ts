import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../_db';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { id } = req.query as Record<string, string>;
  if (!id) return res.status(400).json({ error: 'Missing id' });
  try {
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const order = orderRes.rows[0];
    const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    order.items = itemsRes.rows;
    return res.status(200).json(order);
  } catch (err: any) {
    console.error('get order error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
