import express, { Request, Response } from 'express';
import { query } from '../db';

const router = express.Router();

// Get all menu items
router.get('/', async (req: Request, res: Response) => {
  try {
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
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get a single menu item by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Get all available toppings
router.get('/toppings/all', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        id, 
        name, 
        price
      FROM toppings
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching toppings:', error);
    res.status(500).json({ error: 'Failed to fetch toppings' });
  }
});

// Add a new menu item (admin function)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, basePrice, image, category } = req.body;
    
    const result = await query(
      `INSERT INTO menu_items (name, description, base_price, image_url, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, base_price as "basePrice", image_url as "image", category`,
      [name, description, basePrice, image, category]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// Update a menu item (admin function)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete a menu item (admin function)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM menu_items WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

export default router;
