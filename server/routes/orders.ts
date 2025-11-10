import express, { Request, Response } from 'express';
import { query } from '../db';

const router = express.Router();

// Get all orders
router.get('/', async (req: Request, res: Response) => {
  try {
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
            'menuItemName', mi.name,
            'quantity', oi.quantity,
            'size', oi.size,
            'sugarLevel', oi.sugar_level,
            'toppings', oi.toppings,
            'price', oi.price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      GROUP BY o.id, o.total_price, o.status, o.created_at
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get a single order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
            'menuItemName', mi.name,
            'quantity', oi.quantity,
            'size', oi.size,
            'sugarLevel', oi.sugar_level,
            'toppings', oi.toppings,
            'price', oi.price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE o.id = $1
      GROUP BY o.id, o.total_price, o.status, o.created_at
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create a new order
router.post('/', async (req: Request, res: Response) => {
  const client = await query('BEGIN', []);
  
  try {
    const { items, totalPrice } = req.body;
    
    // Insert order
    const orderResult = await query(
      `INSERT INTO orders (total_price, status)
       VALUES ($1, $2)
       RETURNING id, total_price as "totalPrice", status, created_at as "createdAt"`,
      [totalPrice, 'pending']
    );
    
    const orderId = orderResult.rows[0].id;
    
    // Insert order items
    const orderItems = [];
    for (const item of items) {
      const itemResult = await query(
        `INSERT INTO order_items (
          order_id, 
          menu_item_id, 
          quantity, 
          size, 
          sugar_level, 
          toppings, 
          price
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, menu_item_id as "menuItemId", quantity, size, sugar_level as "sugarLevel", toppings, price`,
        [
          orderId,
          item.menuItemId,
          item.quantity,
          item.size,
          item.sugarLevel,
          JSON.stringify(item.toppings),
          item.price
        ]
      );
      orderItems.push(itemResult.rows[0]);
    }
    
    await query('COMMIT', []);
    
    res.status(201).json({
      ...orderResult.rows[0],
      items: orderItems
    });
  } catch (error) {
    await query('ROLLBACK', []);
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete an order (admin function)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete order items first (due to foreign key constraint)
    await query('DELETE FROM order_items WHERE order_id = $1', [id]);
    
    // Delete the order
    const result = await query('DELETE FROM orders WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
