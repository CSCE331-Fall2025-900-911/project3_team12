import express, { Request, Response } from 'express';
import { query } from '../db';

const router = express.Router();

// Get all managers
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, email, created_at FROM managers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch managers',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check if an email is a manager
router.get('/check/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const result = await query('SELECT id, email FROM managers WHERE email = $1', [email]);
    
    if (result.rows.length > 0) {
      res.json({ isManager: true, manager: result.rows[0] });
    } else {
      res.json({ isManager: false });
    }
  } catch (error) {
    console.error('Error checking manager:', error);
    res.status(500).json({ 
      error: 'Failed to check manager status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add a new manager
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if manager already exists
    const existing = await query('SELECT id FROM managers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Manager already exists' });
    }

    // Insert new manager
    const result = await query(
      'INSERT INTO managers (email) VALUES ($1) RETURNING id, email, created_at',
      [email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding manager:', error);
    res.status(500).json({ 
      error: 'Failed to add manager',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete a manager
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check how many managers exist
    const countResult = await query('SELECT COUNT(*) FROM managers');
    const managerCount = parseInt(countResult.rows[0].count);

    // Prevent deleting the last manager
    if (managerCount <= 1) {
      return res.status(400).json({ 
        error: 'Cannot delete the last manager. At least one manager must remain in the system.' 
      });
    }

    const result = await query('DELETE FROM managers WHERE id = $1 RETURNING email', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    res.json({ 
      message: 'Manager deleted successfully',
      email: result.rows[0].email
    });
  } catch (error) {
    console.error('Error deleting manager:', error);
    res.status(500).json({ 
      error: 'Failed to delete manager',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
