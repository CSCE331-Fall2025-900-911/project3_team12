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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query;

    // GET /api/menu - Get all menu items
    if (req.method === 'GET' && !id) {
      const result = await query(`
        SELECT 
          id, 
          name, 
          description, 
          base_price as "basePrice", 
          image_url as "image",
          category
        FROM menu_items
        ORDER BY category, name
      `);
      return res.status(200).json(result.rows);
    }

    // GET /api/menu?id=X - Get single menu item
    if (req.method === 'GET' && id) {
      const result = await query(
        `SELECT 
          id, 
          name, 
          description, 
          base_price as "basePrice", 
          image_url as "image",
          category
        FROM menu_items 
        WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    // POST /api/menu - Add new menu item
    if (req.method === 'POST') {
      const { name, description, basePrice, image, category } = req.body;
      
      const result = await query(
        `INSERT INTO menu_items (name, description, base_price, image_url, category)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, description, base_price as "basePrice", image_url as "image", category`,
        [name, description, basePrice, image, category]
      );
      
      return res.status(201).json(result.rows[0]);
    }

    // PUT /api/menu?id=X - Update menu item
    if (req.method === 'PUT' && id) {
      const { name, description, basePrice, image, category } = req.body;
      
      const result = await query(
        `UPDATE menu_items 
         SET name = $1, description = $2, base_price = $3, image_url = $4, category = $5
         WHERE id = $6
         RETURNING id, name, description, base_price as "basePrice", image_url as "image", category`,
        [name, description, basePrice, image, category, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    // DELETE /api/menu?id=X - Delete menu item
    if (req.method === 'DELETE' && id) {
      const result = await query('DELETE FROM menu_items WHERE id = $1', [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      
      return res.status(200).json({ message: 'Menu item deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in menu handler:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
