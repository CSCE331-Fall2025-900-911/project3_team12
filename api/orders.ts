import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
});

const query = async (text: string, params?: any[]) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id, action } = req.query;

    // GET /api/orders - Get all orders
    if (req.method === 'GET' && !id) {
      const result = await query(`
        SELECT 
          o.id,
          o.total_price as "totalPrice",
          o.status,
          o.created_at as "createdAt",
          json_agg(
            json_build_object(
              'id', oi.id,
              'menuItemId', oi.menu_item_id,
              'itemName', oi.item_name,
              'quantity', oi.quantity,
              'size', oi.size,
              'sugarLevel', oi.sugar_level,
              'toppings', oi.toppings,
              'price', oi.price
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id, o.total_price, o.status, o.created_at
        ORDER BY o.created_at DESC
      `);
      return res.status(200).json(result.rows);
    }

    // GET /api/orders?id=X - Get single order
    if (req.method === 'GET' && id) {
      const result = await query(`
        SELECT 
          o.id,
          o.total_price as "totalPrice",
          o.status,
          o.created_at as "createdAt",
          json_agg(
            json_build_object(
              'id', oi.id,
              'menuItemId', oi.menu_item_id,
              'itemName', oi.item_name,
              'quantity', oi.quantity,
              'size', oi.size,
              'sugarLevel', oi.sugar_level,
              'toppings', oi.toppings,
              'price', oi.price
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
        GROUP BY o.id, o.total_price, o.status, o.created_at
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    // POST /api/orders - Create new order
    if (req.method === 'POST') {
      const { items, totalPrice } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
      }

      if (typeof totalPrice !== 'number' || Number.isNaN(totalPrice)) {
        return res.status(400).json({ error: 'totalPrice must be a valid number' });
      }

      const client = await pool.connect();
      let transactionStarted = false;

      try {
        await client.query('BEGIN');
        transactionStarted = true;

        const orderResult = await client.query(
          `INSERT INTO orders (total_price, status)
           VALUES ($1, $2)
           RETURNING id, total_price as "totalPrice", status, created_at as "createdAt"`,
          [totalPrice, 'pending']
        );

        const orderId = orderResult.rows[0].id;

        const orderItems: any[] = [];
        for (const item of items) {
          const itemResult = await client.query(
            `INSERT INTO order_items (
              order_id,
              menu_item_id,
              item_name,
              quantity,
              size,
              sugar_level,
              toppings,
              price
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, menu_item_id as "menuItemId", item_name as "itemName", quantity, size, sugar_level as "sugarLevel", toppings, price`,
            [
              orderId,
              item.menuItemId,
              item.itemName,
              item.quantity,
              item.size,
              item.sugarLevel,
              JSON.stringify(item.toppings ?? []),
              item.price
            ]
          );
          orderItems.push(itemResult.rows[0]);
        }

        await client.query('COMMIT');

        return res.status(201).json({
          ...orderResult.rows[0],
          items: orderItems
        });
      } catch (error) {
        if (transactionStarted) {
          try {
            await client.query('ROLLBACK');
          } catch (rollbackErr) {
            console.error('Error rolling back transaction:', rollbackErr);
          }
        }
        throw error;
      } finally {
        client.release();
      }
    }

    // PATCH /api/orders?id=X&action=status - Update order status
    if (req.method === 'PATCH' && id && action === 'status') {
      const { status } = req.body;
      
      const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const result = await query(
        `UPDATE orders 
         SET status = $1
         WHERE id = $2
         RETURNING id, total_price as "totalPrice", status, created_at as "createdAt"`,
        [status, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    // DELETE /api/orders?id=X - Delete order
    if (req.method === 'DELETE' && id) {
      await query('DELETE FROM order_items WHERE order_id = $1', [id]);
      const result = await query('DELETE FROM orders WHERE id = $1', [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      return res.status(200).json({ message: 'Order deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in orders handler:', error);
    return res.status(500).json({ 
      error: 'Failed to process order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
