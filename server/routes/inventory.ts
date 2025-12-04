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

export default router;
