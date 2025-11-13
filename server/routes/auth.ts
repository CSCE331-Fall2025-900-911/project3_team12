import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

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

    // Optional: Check if the email is from an authorized domain
    // Uncomment and modify this if you want to restrict to specific emails/domains
    /*
    const authorizedDomains = ['yourdomain.com'];
    const emailDomain = payload.email?.split('@')[1];
    
    if (!authorizedDomains.includes(emailDomain || '')) {
      return res.status(403).json({ error: 'Unauthorized domain' });
    }
    */

    // Return user information
    res.json({
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    });
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

    res.json({
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
