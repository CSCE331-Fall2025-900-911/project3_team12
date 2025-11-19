import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // POST /api/auth?action=google - Verify Google OAuth token
    if (req.method === 'POST' && action === 'google') {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({ error: 'Credential is required' });
      }

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      return res.status(200).json({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified,
      });
    }

    // POST /api/auth?action=logout - Logout
    if (req.method === 'POST' && action === 'logout') {
      return res.status(200).json({ message: 'Logged out successfully' });
    }

    // GET /api/auth?action=me - Check authentication status
    if (req.method === 'GET' && action === 'me') {
      const authHeader = req.headers.authorization as string;
      
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

      return res.status(200).json({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
