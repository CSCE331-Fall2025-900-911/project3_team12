import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../db';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google OAuth token
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Credential is required' });
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if the email is in the managers table
    const email = payload.email;
    if (!email) {
      return res.status(401).json({ error: 'Email not found in token' });
    }

    try {
      const managerCheck = await query('SELECT id, email FROM managers WHERE email = $1', [email]);
      
      if (managerCheck.rows.length === 0) {
        return res.status(403).json({ 
          error: 'Unauthorized',
          message: 'Your email is not authorized to access the manager dashboard. Please contact an administrator.'
        });
      }

      // Return user information if authorized
      res.json({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified,
        isManager: true
      });
    } catch (dbError) {
      console.error('Database error during authorization check:', dbError);
      return res.status(500).json({ 
        error: 'Authorization check failed',
        message: 'Unable to verify manager status. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Logout endpoint (optional - mainly for server-side session management)
router.post('/logout', (req: Request, res: Response) => {
  // If you implement sessions, clear them here
  res.json({ message: 'Logged out successfully' });
});

// Check authentication status
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if the email is in the managers table
    const email = payload.email;
    if (!email) {
      return res.status(401).json({ error: 'Email not found in token' });
    }

    try {
      const managerCheck = await query('SELECT id, email FROM managers WHERE email = $1', [email]);
      
      if (managerCheck.rows.length === 0) {
        return res.status(403).json({ 
          error: 'Unauthorized',
          message: 'Your email is not authorized to access the manager dashboard.'
        });
      }

      res.json({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        isManager: true
      });
    } catch (dbError) {
      console.error('Database error during /me check:', dbError);
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
